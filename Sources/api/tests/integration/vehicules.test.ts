import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '~~/expressApp';
import { MailerService } from '~~/Services/MailerService';
import { Elements, Sections } from '~~/Models';
import { login, seedDatabase } from './seed';

// Pas d'envoi réel d'e-mail : on vérifie seulement ce qui serait envoyé
vi.mock('~~/Services/MailerService', () => ({ MailerService: { sendMailAsync: vi.fn() } }));

let ids: Awaited<ReturnType<typeof seedDatabase>>;
let admin: string[];
let user: string[];
beforeEach(async () => {
    vi.clearAllMocks();
    ids = await seedDatabase();
    [admin, user] = await Promise.all([login('admin@sdis49.fr'), login('agent@sdis49.fr')]);
});

describe('véhicules', () => {
    it('liste les véhicules', async () => {
        const res = await request(app).get('/api/vehicules').set('Cookie', user).expect(200);
        expect(res.body).toEqual([{ id: ids.vehicule, name: 'VSAV' }]);
    });

    it('renvoie l’arbre complet des sections (3 niveaux) avec leurs éléments', async () => {
        const res = await request(app).get(`/api/vehicules/${ids.vehicule}`).set('Cookie', user).expect(200);

        expect(res.body.name).toBe('VSAV');
        const [cellule] = res.body.sections;
        expect(cellule).toMatchObject({ name: 'Cellule', has_photo: false, elements: [{ name: 'Phare', quantite: 1 }] });
        const [sac] = cellule.subSections;
        expect(sac).toMatchObject({ name: 'Sac prompt secours', elements: [{ name: 'Tensiomètre' }] });
        expect(sac.subSections).toMatchObject([{ name: 'Poche bleue', subSections: [], elements: [{ name: 'Thermomètre', quantite: 2 }] }]);
    });

    it('un admin crée puis supprime un véhicule', async () => {
        const created = await request(app).post('/api/vehicules').set('Cookie', admin).send({ name: 'FPT' }).expect(201);
        expect(created.body).toMatchObject({ name: 'FPT' });
        await request(app).delete(`/api/vehicules/${created.body.id}`).set('Cookie', admin).expect(200);
        await request(app).delete(`/api/vehicules/${created.body.id}`).set('Cookie', admin).expect(404);
    });

    it('400 pour un nom vide', async () => {
        await request(app).post('/api/vehicules').set('Cookie', admin).send({ name: ' ' }).expect(400);
    });
});

describe('POST /api/vehicules/verifications/:id', () => {
    it('génère le PDF et l’envoie au responsable de la garde de l’agent', async () => {
        await request(app)
            .post(`/api/vehicules/verifications/${ids.vehicule}`)
            .set('Cookie', user)
            .send({ 0: { elementId: ids.phare, status: 'OK' }, 1: { elementId: ids.thermometre, status: 'KO', comment: 'pile HS' } })
            .expect(200, 'Vehicule validated');

        const message = vi.mocked(MailerService.sendMailAsync).mock.calls[0][0];
        expect(message.to).toBe('admin@sdis49.fr');
        expect(message.subject).toBe('Rapport de vérification - VSAV');
        const pdf = Buffer.from(message.attachments![0].Base64Content, 'base64');
        expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    });

    it('400 si un élément n’a pas de statut OK/KO', async () => {
        await request(app)
            .post(`/api/vehicules/verifications/${ids.vehicule}`)
            .set('Cookie', user)
            .send({ 0: { elementId: ids.phare, status: '' } })
            .expect(400);
        expect(MailerService.sendMailAsync).not.toHaveBeenCalled();
    });

    it('404 pour un véhicule inconnu', async () => {
        await request(app).post('/api/vehicules/verifications/999').set('Cookie', user).send({}).expect(404);
    });

    it('500 si la garde de l’agent n’a pas de responsable', async () => {
        await request(app).put(`/api/gardes/${ids.garde1}/responsable`).set('Cookie', admin).send({ responsableId: null }).expect(200);
        await request(app)
            .post(`/api/vehicules/verifications/${ids.vehicule}`)
            .set('Cookie', user)
            .send({ 0: { elementId: ids.phare, status: 'OK' } })
            .expect(500);
    });
});

describe('sections', () => {
    it('crée une section racine puis une sous-section', async () => {
        const root = await request(app).post('/api/sections').set('Cookie', admin).send({ name: 'Cabine', vehicule_id: ids.vehicule }).expect(201);
        expect(root.body).toMatchObject({ name: 'Cabine', vehicule_id: ids.vehicule, parent_section_id: null });
        const child = await request(app).post('/api/sections').set('Cookie', admin).send({ name: 'Boîte à gants', parent_section_id: root.body.id }).expect(201);
        expect(child.body).toMatchObject({ vehicule_id: null, parent_section_id: root.body.id });
    });

    it('400 sans nom ou sans rattachement, 500 si les deux rattachements sont fournis (XOR)', async () => {
        await request(app).post('/api/sections').set('Cookie', admin).send({ vehicule_id: ids.vehicule }).expect(400);
        await request(app).post('/api/sections').set('Cookie', admin).send({ name: 'X' }).expect(400);
        await request(app).post('/api/sections').set('Cookie', admin).send({ name: 'X', vehicule_id: ids.vehicule, parent_section_id: ids.cellule }).expect(500);
    });

    it('renomme une section, 404 si elle n’existe pas', async () => {
        const res = await request(app).put(`/api/sections/${ids.sac}`).set('Cookie', admin).send({ name: 'Sac rouge' }).expect(200);
        expect(res.body).toMatchObject({ name: 'Sac rouge', parent_section_id: ids.cellule });
        await request(app).put('/api/sections/999').set('Cookie', admin).send({ name: 'X' }).expect(404);
    });

    it('supprime une section avec ses sous-sections et éléments', async () => {
        await request(app).delete(`/api/sections/${ids.sac}`).set('Cookie', admin).expect(204);
        expect(await Sections.count()).toBe(1);
        expect(await Elements.count()).toBe(1);
        await request(app).delete(`/api/sections/${ids.sac}`).set('Cookie', admin).expect(404);
    });

    it('déplace une sous-section à la racine puis sous une autre section', async () => {
        await request(app).patch(`/api/sections/${ids.poche}/parent`).set('Cookie', admin).send({ parent_section_id: null }).expect(204);
        expect((await Sections.findByPk(ids.poche))!.toJSON()).toMatchObject({ vehicule_id: ids.vehicule, parent_section_id: null });

        await request(app).patch(`/api/sections/${ids.poche}/parent`).set('Cookie', admin).send({ parent_section_id: ids.cellule }).expect(204);
        expect((await Sections.findByPk(ids.poche))!.toJSON()).toMatchObject({ vehicule_id: null, parent_section_id: ids.cellule });
    });

    it('refuse un déplacement créant un cycle (400) ou vers une section inconnue (404)', async () => {
        await request(app).patch(`/api/sections/${ids.cellule}/parent`).set('Cookie', admin).send({ parent_section_id: ids.poche }).expect(400);
        await request(app).patch(`/api/sections/${ids.poche}/parent`).set('Cookie', admin).send({ parent_section_id: 999 }).expect(404);
        await request(app).patch(`/api/sections/${ids.poche}/parent`).set('Cookie', admin).send({ parent_section_id: 'a' }).expect(400);
    });

    it('enregistre, sert puis supprime la photo d’une section', async () => {
        const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
        await request(app).get(`/api/sections/${ids.sac}/photo`).set('Cookie', user).expect(404);
        await request(app).put(`/api/sections/${ids.sac}/photo`).set('Cookie', admin).set('Content-Type', 'image/png').send(png).expect(204);

        const photo = await request(app).get(`/api/sections/${ids.sac}/photo`).set('Cookie', user).expect(200);
        expect(photo.get('Content-Type')).toBe('image/png');
        expect(Buffer.compare(photo.body, png)).toBe(0);
        const tree = await request(app).get(`/api/vehicules/${ids.vehicule}`).set('Cookie', user);
        expect(tree.body.sections[0].subSections[0].has_photo).toBe(true);

        await request(app).delete(`/api/sections/${ids.sac}/photo`).set('Cookie', admin).expect(204);
        await request(app).get(`/api/sections/${ids.sac}/photo`).set('Cookie', user).expect(404);
    });

    it('400 pour une photo au format non supporté, 404 pour une section inconnue', async () => {
        await request(app).put(`/api/sections/${ids.sac}/photo`).set('Cookie', admin).set('Content-Type', 'image/gif').send(Buffer.from('GIF89a')).expect(400);
        await request(app).put('/api/sections/999/photo').set('Cookie', admin).set('Content-Type', 'image/jpeg').send(Buffer.from([0xff, 0xd8, 0xff])).expect(404);
    });
});

describe('éléments', () => {
    it('crée, modifie et supprime un élément', async () => {
        const created = await request(app).post('/api/elements').set('Cookie', admin).send({ name: 'Garrot', section_id: ids.poche }).expect(201);
        expect(created.body).toMatchObject({ name: 'Garrot', quantite: 1, section_id: ids.poche });

        const updated = await request(app).put(`/api/elements/${created.body.id}`).set('Cookie', admin).send({ name: 'Garrot tourniquet', quantite: 3 }).expect(200);
        expect(updated.body).toMatchObject({ name: 'Garrot tourniquet', quantite: 3 });

        await request(app).delete(`/api/elements/${created.body.id}`).set('Cookie', admin).expect(204);
        await request(app).delete(`/api/elements/${created.body.id}`).set('Cookie', admin).expect(404);
    });

    it('400 sans nom, sans section ou avec une quantité invalide ; 404 pour un élément inconnu', async () => {
        await request(app).post('/api/elements').set('Cookie', admin).send({ name: 'X' }).expect(400);
        await request(app).post('/api/elements').set('Cookie', admin).send({ name: 'X', section_id: ids.sac, quantite: 0 }).expect(400);
        await request(app).put(`/api/elements/${ids.phare}`).set('Cookie', admin).send({ name: 'X', quantite: 1.5 }).expect(400);
        await request(app).put('/api/elements/999').set('Cookie', admin).send({ name: 'X' }).expect(404);
    });
});
