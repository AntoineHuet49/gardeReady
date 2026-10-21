import { beforeEach, describe, expect, it } from 'vitest';
import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '~~/expressApp';
import { Users } from '~~/Models';
import { login, PASSWORD, seedDatabase } from './seed';

// Semaine du 02/10/2026 : Garde 1 (admin Alice, agent Bob) ; semaine du 09/10 : Garde 2
const SEMAINE_G1 = '2026-10-02';
const SEMAINE_G2 = '2026-10-09';

let ids: Awaited<ReturnType<typeof seedDatabase>>;
let adminG2: number;
const put = (cookie: string[], week: string, user_ids: number[]) =>
    request(app).put(`/api/vehicule-assignments/${week}`).set('Cookie', cookie)
        .send({ assignments: [{ vehicule_id: ids.vehicule, user_ids }] });

beforeEach(async () => {
    ids = await seedDatabase();
    const hash = await bcrypt.hash(PASSWORD, 4);
    const make = (email: string, role: 'admin' | 'superAdmin', garde_id: number | null) =>
        Users.create({ email, password: hash, firstname: 'X', lastname: 'Y', role, garde_id } as never);
    adminG2 = (await make('admin2@sdis49.fr', 'admin', ids.garde2)).id;
    await make('super@sdis49.fr', 'superAdmin', null);
    await make('sansgarde@sdis49.fr', 'admin', null);
});

describe('PUT /api/vehicule-assignments/:shiftDate', () => {
    it('un admin assigne un membre de sa garde la semaine de sa garde', async () => {
        await put(await login('admin@sdis49.fr'), SEMAINE_G1, [ids.user]).expect(200);
    });

    it('403 : un admin ne peut pas assigner sur la garde d’une autre garde', async () => {
        const res = await put(await login('admin@sdis49.fr'), SEMAINE_G2, [adminG2]).expect(403);
        expect(res.body.message).toContain('votre garde');
        const other = await put(await login('admin2@sdis49.fr'), SEMAINE_G1, [ids.user]).expect(403);
        expect(other.body.message).toContain('votre garde');
    });

    it('403 : un admin sans garde ne peut rien assigner', async () => {
        await put(await login('sansgarde@sdis49.fr'), SEMAINE_G1, [ids.user]).expect(403);
    });

    it('un superAdmin assigne pour n’importe quelle garde', async () => {
        const cookie = await login('super@sdis49.fr');
        await put(cookie, SEMAINE_G1, [ids.user]).expect(200);
        await put(cookie, SEMAINE_G2, [adminG2]).expect(200);
    });

    it('un agent simple reste refusé', async () => {
        await put(await login('agent@sdis49.fr'), SEMAINE_G1, [ids.user]).expect(403);
    });
});
