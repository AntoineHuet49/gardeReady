import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import app from '~~/expressApp';
import { Gardes, Users } from '~~/Models';
import { login, PASSWORD, REFERENCE_DATE, seedDatabase } from './seed';

let ids: Awaited<ReturnType<typeof seedDatabase>>;
let admin: string[];
let user: string[];
beforeEach(async () => {
    ids = await seedDatabase();
    [admin, user] = await Promise.all([login('admin@sdis49.fr'), login('agent@sdis49.fr')]);
});

describe('utilisateurs', () => {
    it('un admin ne voit pas les superAdmin, un superAdmin voit tout', async () => {
        await Users.create({ email: 'root@sdis49.fr', password: await bcrypt.hash(PASSWORD, 4), firstname: 'R', lastname: 'Oot', role: 'superAdmin' });
        const vuParAdmin = await request(app).get('/api/users').set('Cookie', admin).expect(200);
        expect(vuParAdmin.body.map((u: { email: string }) => u.email).sort()).toEqual(['admin@sdis49.fr', 'agent@sdis49.fr']);
        expect(vuParAdmin.body[0]).not.toHaveProperty('password');

        const vuParRoot = await request(app).get('/api/users').set('Cookie', await login('root@sdis49.fr')).expect(200);
        expect(vuParRoot.body).toHaveLength(3);
    });

    it('crée un compte sans mot de passe, puis le lien d’invitation permet de le définir une seule fois', async () => {
        const res = await request(app)
            .post('/api/users')
            .set('Cookie', admin)
            .send({ email: 'nouveau@sdis49.fr', firstname: 'Nina', lastname: 'Nouvelle', role: 'user', garde_id: ids.garde2 })
            .expect(201);
        // Mailjet non configuré en test : le compte est créé, l'admin est prévenu que l'invitation n'est pas partie
        expect(res.body).toMatchObject({ user: { email: 'nouveau@sdis49.fr', garde_id: ids.garde2 }, invitationSent: false });

        await request(app).post('/api/auth/login').send({ email: 'nouveau@sdis49.fr', password: 'Nouveau123' }).expect(400);
        const token = jwt.sign({ sub: String(res.body.user.id) }, `${process.env.JWT_SECRET}:set-password`);
        await request(app).post('/api/auth/set-password').send({ token, password: 'faible' }).expect(400);
        await request(app).post('/api/auth/set-password').send({ token, password: 'Nouveau123' }).expect(200);
        await login('nouveau@sdis49.fr', 'Nouveau123');
        await request(app).post('/api/auth/set-password').send({ token, password: 'Autre1234' }).expect(400);
    });

    it.each([
        [400, { email: 'x@gmail.com', firstname: 'X', lastname: 'Y', role: 'user' }],
        [400, { email: 'agent@sdis49.fr', firstname: 'X', lastname: 'Y', role: 'user' }],
        [400, { email: 'x@sdis49.fr', firstname: 'X', role: 'user' }],
        [403, { email: 'x@sdis49.fr', firstname: 'X', lastname: 'Y', role: 'superAdmin' }],
    ])('création refusée (%i) : %j', async (status, body) => {
        await request(app).post('/api/users').set('Cookie', admin).send(body).expect(status);
    });

    it('modifie l’identité et le rôle d’un compte', async () => {
        const res = await request(app).put(`/api/users/${ids.user}`).set('Cookie', admin)
            .send({ email: 'bob@sdis49.fr', firstname: 'Bobby', lastname: 'Agent' }).expect(200);
        expect(res.body.user).toMatchObject({ email: 'bob@sdis49.fr', firstname: 'Bobby' });

        await request(app).put(`/api/users/${ids.user}`).set('Cookie', admin)
            .send({ email: 'admin@sdis49.fr', firstname: 'B', lastname: 'A' }).expect(400);

        const role = await request(app).patch(`/api/users/${ids.user}/role`).set('Cookie', admin).send({ role: 'admin' }).expect(200);
        expect(role.body.user.role).toBe('admin');
        await request(app).patch(`/api/users/${ids.user}/role`).set('Cookie', admin).send({ role: 'superAdmin' }).expect(400);
    });

    it('changer de garde retire le rôle de responsable de l’ancienne garde', async () => {
        const res = await request(app).patch(`/api/users/${ids.admin}/garde`).set('Cookie', admin).send({ garde_id: ids.garde2 }).expect(200);
        expect(res.body.user.garde_id).toBe(ids.garde2);
        expect((await Gardes.findByPk(ids.garde1))!.responsable).toBeNull();

        await request(app).patch(`/api/users/${ids.user}/garde`).set('Cookie', admin).send({ garde_id: 999 }).expect(400);
    });

    it('supprime un compte, mais pas le sien', async () => {
        await request(app).delete(`/api/users/${ids.admin}`).set('Cookie', admin).expect(400);
        await request(app).delete(`/api/users/${ids.user}`).set('Cookie', admin).expect(200);
        await request(app).delete(`/api/users/${ids.user}`).set('Cookie', admin).expect(400);
    });
});

describe('gardes', () => {
    it('liste les gardes triées par numero, avec responsable et membres (sans email)', async () => {
        const res = await request(app).get('/api/gardes').set('Cookie', user).expect(200);
        expect(res.body.map((g: { numero: number }) => g.numero)).toEqual([1, 2]);
        expect(res.body[0]).toMatchObject({
            id: ids.garde1,
            responsable: ids.admin,
            responsableUser: { id: ids.admin, email: 'admin@sdis49.fr' },
        });
        expect(res.body[0].users.map((u: { lastname: string }) => u.lastname)).toEqual(['Admin', 'Agent']);
        expect(res.body[0].users[0]).not.toHaveProperty('email');
        expect(res.body[1]).toMatchObject({ responsable: null, users: [] });
    });

    it('crée une garde sans responsable, refuse un numero en double ou invalide', async () => {
        const res = await request(app).post('/api/gardes').set('Cookie', admin).send({ numero: 3, color: 'Vert' }).expect(201);
        expect(res.body).toMatchObject({ numero: 3, color: 'Vert', responsable: null });
        await request(app).post('/api/gardes').set('Cookie', admin).send({ numero: 3, color: 'Bleu' }).expect(409);
        await request(app).post('/api/gardes').set('Cookie', admin).send({ numero: '4', color: 'Bleu' }).expect(400);
        await request(app).post('/api/gardes').set('Cookie', admin).send({ numero: 4, color: '' }).expect(400);
    });

    it('change puis retire le responsable', async () => {
        const res = await request(app).put(`/api/gardes/${ids.garde2}/responsable`).set('Cookie', admin).send({ responsableId: ids.user }).expect(200);
        expect(res.body.responsableUser).toMatchObject({ id: ids.user, email: 'agent@sdis49.fr' });
        const vide = await request(app).put(`/api/gardes/${ids.garde2}/responsable`).set('Cookie', admin).send({ responsableId: null }).expect(200);
        expect(vide.body.responsable).toBeNull();
        await request(app).put(`/api/gardes/999/responsable`).set('Cookie', admin).send({ responsableId: null }).expect(404);
        await request(app).put(`/api/gardes/${ids.garde2}/responsable`).set('Cookie', admin).send({ responsableId: 'x' }).expect(400);
    });

    it('supprime une garde (et ses membres, par cascade)', async () => {
        await request(app).delete(`/api/gardes/${ids.garde2}`).set('Cookie', admin).expect(200);
        await request(app).delete(`/api/gardes/${ids.garde2}`).set('Cookie', admin).expect(404);
        await request(app).delete('/api/gardes/abc').set('Cookie', admin).expect(400);
    });
});

describe('rotation des gardes', () => {
    it('lit et met à jour la date de référence (un vendredi)', async () => {
        expect((await request(app).get('/api/garde-rotation').set('Cookie', user).expect(200)).body).toEqual({ id: 1, reference_date: REFERENCE_DATE });
        const res = await request(app).put('/api/garde-rotation').set('Cookie', admin).send({ reference_date: '2026-10-09' }).expect(200);
        expect(res.body).toMatchObject({ reference_date: '2026-10-09' });
        await request(app).put('/api/garde-rotation').set('Cookie', admin).send({ reference_date: '2026-10-10' }).expect(400);
    });
});

describe('assignations véhicules', () => {
    it('le responsable de la garde de service assigne ses membres, tout connecté peut les lire', async () => {
        const res = await request(app).put(`/api/vehicule-assignments/${REFERENCE_DATE}`).set('Cookie', admin)
            .send({ assignments: [{ vehicule_id: ids.vehicule, user_ids: [ids.user, ids.user] }] }).expect(200);
        expect(res.body).toMatchObject([{ shift_date: REFERENCE_DATE, vehicule: { name: 'VSAV' }, user: { id: ids.user } }]);

        const lu = await request(app).get('/api/vehicule-assignments').query({ from: REFERENCE_DATE, to: '2026-10-09' }).set('Cookie', user).expect(200);
        expect(lu.body).toHaveLength(1);

        // Remplacement complet de la semaine
        await request(app).put(`/api/vehicule-assignments/${REFERENCE_DATE}`).set('Cookie', admin).send({ assignments: [] }).expect(200, []);
    });

    it('403 pour un agent qui n’est ni admin ni responsable', async () => {
        await request(app).put(`/api/vehicule-assignments/${REFERENCE_DATE}`).set('Cookie', user).send({ assignments: [] }).expect(403);
    });

    it('400/403 : semaine d’une autre garde, véhicule inconnu, format ou dates invalides', async () => {
        // La semaine suivante est celle de la Garde 2 : l'admin de la Garde 1 n'a pas la main dessus (403, cf. vehicule-assignments.test.ts)
        await request(app).put('/api/vehicule-assignments/2026-10-09').set('Cookie', admin)
            .send({ assignments: [{ vehicule_id: ids.vehicule, user_ids: [ids.user] }] }).expect(403);
        await request(app).put(`/api/vehicule-assignments/${REFERENCE_DATE}`).set('Cookie', admin)
            .send({ assignments: [{ vehicule_id: 999, user_ids: [ids.user] }] }).expect(400);
        await request(app).put(`/api/vehicule-assignments/${REFERENCE_DATE}`).set('Cookie', admin).send({ assignments: [{ vehicule_id: 'a' }] }).expect(400);
        await request(app).put('/api/vehicule-assignments/2026-10-03').set('Cookie', admin).send({ assignments: [] }).expect(400);
        await request(app).get('/api/vehicule-assignments').query({ from: '2026-10-09', to: REFERENCE_DATE }).set('Cookie', user).expect(400);
        await request(app).get('/api/vehicule-assignments').query({ from: '2026-01-02', to: '2027-10-01' }).set('Cookie', user).expect(400);
    });
});

describe('retours utilisateurs', () => {
    it('400 pour un retour invalide, 502 si GitHub n’est pas configuré', async () => {
        vi.stubEnv('GITHUB_TOKEN', '');
        await request(app).post('/api/feedback').set('Cookie', user).send({ type: 'autre', message: 'Bonjour' }).expect(400);
        await request(app).post('/api/feedback').set('Cookie', user).send({ type: 'bug', message: 'ok' }).expect(400);
        await request(app).post('/api/feedback').set('Cookie', user).send({ type: 'bug', message: 'x'.repeat(5001) }).expect(400);
        await request(app).post('/api/feedback').set('Cookie', user).send({ type: 'bug', message: 'Ça plante' }).expect(502);
        vi.unstubAllEnvs();
    });
});
