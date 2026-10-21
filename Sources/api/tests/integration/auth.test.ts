import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '~~/expressApp';
import { login, PASSWORD, seedDatabase } from './seed';

let userCookie: string[];
beforeAll(async () => {
    await seedDatabase();
    userCookie = await login('agent@sdis49.fr');
});

describe('GET /api/auth/me et POST /api/auth/logout', () => {
    it('me renvoie l\'utilisateur de la session, 401 sans cookie', async () => {
        const res = await request(app).get('/api/auth/me').set('Cookie', userCookie).expect(200);
        expect(res.body).toMatchObject({ email: 'agent@sdis49.fr', role: 'user' });
        await request(app).get('/api/auth/me').expect(401);
    });

    it('logout efface le cookie', async () => {
        const res = await request(app).post('/api/auth/logout').expect(200);
        expect(res.get('Set-Cookie')![0]).toMatch(/^token=;.*(Expires=Thu, 01 Jan 1970|Max-Age=0)/i);
    });
});

describe('POST /api/auth/login', () => {
    it('pose un cookie de session JWT réutilisable sur les routes protégées', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: 'agent@sdis49.fr', password: PASSWORD }).expect(200);

        const cookie = res.get('Set-Cookie')![0];
        const token = /^token=([^;]+)/.exec(cookie)![1];
        expect(jwt.decode(token)).toMatchObject({ email: 'agent@sdis49.fr', role: 'user' });
        expect(jwt.decode(token)).not.toHaveProperty('password');
        expect(cookie).toMatch(/HttpOnly/i);
        expect(cookie).toMatch(/SameSite=Lax/i);

        await request(app).get('/api/vehicules').set('Cookie', res.get('Set-Cookie')!).expect(200);
    });

    it.each([
        ['mauvais mot de passe', 'agent@sdis49.fr', 'Faux1234'],
        ['email inconnu', 'personne@sdis49.fr', PASSWORD],
    ])('400 sans cookie : %s', async (_label, email, password) => {
        const res = await request(app).post('/api/auth/login').send({ email, password }).expect(400);
        expect(res.get('Set-Cookie')).toBeUndefined();
        expect(res.text).toBe('Invalid credentials');
    });

    it('le provider local est actif par défaut, les routes Microsoft renvoient 404', async () => {
        expect((await request(app).get('/api/auth/provider').expect(200)).body).toEqual({ provider: 'local' });
        await request(app).get('/api/auth/microsoft/login').expect(404);
    });
});

// Toutes les routes protégées de routes/routes.ts : [méthode, chemin, admin requis]
const routes: [string, string, boolean][] = [
    ['get', '/api/vehicules', false],
    ['get', '/api/vehicules/1', false],
    ['post', '/api/vehicules', true],
    ['delete', '/api/vehicules/1', true],
    ['post', '/api/vehicules/verifications/1', false],
    ['post', '/api/elements', true],
    ['put', '/api/elements/1', true],
    ['delete', '/api/elements/1', true],
    ['post', '/api/sections', true],
    ['put', '/api/sections/1', true],
    ['delete', '/api/sections/1', true],
    ['patch', '/api/sections/1/parent', true],
    ['get', '/api/sections/1/photo', false],
    ['put', '/api/sections/1/photo', true],
    ['delete', '/api/sections/1/photo', true],
    ['get', '/api/users', true],
    ['post', '/api/users', true],
    ['put', '/api/users/1', true],
    ['patch', '/api/users/1/role', true],
    ['patch', '/api/users/1/garde', true],
    ['delete', '/api/users/1', true],
    ['get', '/api/gardes', false],
    ['post', '/api/gardes', true],
    ['put', '/api/gardes/1/responsable', true],
    ['delete', '/api/gardes/1', true],
    ['get', '/api/garde-rotation', false],
    ['put', '/api/garde-rotation', true],
    ['get', '/api/vehicule-assignments', false],
    ['put', '/api/vehicule-assignments/2026-10-02', false],
    ['post', '/api/feedback', false],
];

const call = (method: string, path: string) => (request(app) as unknown as Record<string, (p: string) => request.Test>)[method](path);

describe('protection des routes', () => {
    it.each(routes)('%s %s : 401 sans cookie', async (method, path) => {
        await call(method, path).expect(401);
    });

    it.each(routes)('%s %s : 401 avec un token invalide', async (method, path) => {
        await call(method, path).set('Cookie', 'token=pas-un-jwt').expect(401);
    });

    it.each(routes.filter(([, , admin]) => admin))('%s %s : 403 pour un simple user', async (method, path) => {
        await call(method, path).set('Cookie', userCookie).expect(403);
    });

    it('401 avec un token expiré', async () => {
        const expired = jwt.sign({ id: 1, role: 'admin', exp: Math.floor(Date.now() / 1000) - 10 }, process.env.JWT_SECRET!);
        await request(app).get('/api/vehicules').set('Cookie', `token=${expired}`).expect(401);
    });
});
