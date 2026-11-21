import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '~~/expressApp';
import { Vehicules, VehiculeKilometrages } from '~~/Models';
import { login, seedDatabase } from './seed';

let ids: Awaited<ReturnType<typeof seedDatabase>>;
let admin: string[];
let user: string[];
const post = (cookie: string[], body: object, vehicule = ids.vehicule) =>
    request(app).post(`/api/vehicules/${vehicule}/kilometrages`).set('Cookie', cookie).send(body);

beforeEach(async () => {
    ids = await seedDatabase();
    [admin, user] = await Promise.all([login('admin@sdis49.fr'), login('agent@sdis49.fr')]);
});

describe('suivi kilométrique', () => {
    it('un agent saisit un relevé, l’admin le retrouve dans l’historique (plus récent d’abord)', async () => {
        await post(user, { kilometrage: 12000, motif: ' Manœuvre ' }).expect(201);
        await post(user, { kilometrage: 12040 }).expect(201);

        const res = await request(app).get(`/api/vehicules/${ids.vehicule}/kilometrages`).set('Cookie', admin).expect(200);
        expect(res.body).toMatchObject([
            { kilometrage: 12040, motif: null, user: { id: ids.user, firstname: 'Bob' } },
            { kilometrage: 12000, motif: 'Manœuvre' },
        ]);
    });

    it('403 : un agent simple ne peut pas lire l’historique', async () => {
        await request(app).get(`/api/vehicules/${ids.vehicule}/kilometrages`).set('Cookie', user).expect(403);
    });

    it('401 sans session', async () => {
        await request(app).post(`/api/vehicules/${ids.vehicule}/kilometrages`).send({ kilometrage: 1 }).expect(401);
    });

    it.each([[-1], [1.5], ['12000'], [null], [3_000_000]])('400 : kilométrage invalide (%j)', async (kilometrage) => {
        await post(user, { kilometrage }).expect(400);
    });

    it('400 : motif trop long', async () => {
        await post(user, { kilometrage: 10, motif: 'x'.repeat(201) }).expect(400);
    });

    it('404 : véhicule inconnu', async () => {
        await post(user, { kilometrage: 10 }, 9999).expect(404);
        await request(app).get('/api/vehicules/9999/kilometrages').set('Cookie', admin).expect(404);
    });

    it('supprimer le véhicule supprime son historique', async () => {
        await post(user, { kilometrage: 10 }).expect(201);
        await Vehicules.destroy({ where: { id: ids.vehicule } });
        const count = await VehiculeKilometrages.count();
        expect(count).toBe(0);
    });
});
