import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '~~/expressApp';
import { Elements, GardeRotation, Gardes, Sections, Users, Vehicules } from '~~/Models';
import { dbContext } from '~~/Utils/Database';

export const PASSWORD = 'Motdepasse1';
// Garde 1 de service la semaine du vendredi 02/10/2026, Garde 2 la suivante
export const REFERENCE_DATE = '2026-10-02';

/** Vide toutes les tables (et remet les séquences à 1) : chaque fichier de test part d'une base propre. */
export async function resetDatabase() {
    await dbContext.query(
        'TRUNCATE users, gardes, garde_rotation, vehicules, sections, elements, vehicule_assignments RESTART IDENTITY CASCADE',
    );
}

/**
 * Jeu de données minimal : 2 gardes (créées dans le désordre pour vérifier le tri par numero), 1 admin
 * responsable de la Garde 1, 1 user, 1 véhicule avec sections sur 3 niveaux et éléments.
 */
export async function seedDatabase() {
    await resetDatabase();
    const hash = await bcrypt.hash(PASSWORD, 4);

    const garde2 = await Gardes.create({ numero: 2, color: 'Jaune' });
    const garde1 = await Gardes.create({ numero: 1, color: 'Rouge' });
    const admin = await Users.create({ email: 'admin@sdis49.fr', password: hash, firstname: 'Alice', lastname: 'Admin', role: 'admin', garde_id: garde1.id });
    const user = await Users.create({ email: 'agent@sdis49.fr', password: hash, firstname: 'Bob', lastname: 'Agent', role: 'user', garde_id: garde1.id });
    await garde1.update({ responsable: admin.id });
    await GardeRotation.create({ id: 1, reference_date: REFERENCE_DATE });

    const vehicule = await Vehicules.create({ name: 'VSAV' });
    const cellule = await Sections.create({ name: 'Cellule', vehicule_id: vehicule.id, parent_section_id: null });
    const sac = await Sections.create({ name: 'Sac prompt secours', vehicule_id: null, parent_section_id: cellule.id });
    const poche = await Sections.create({ name: 'Poche bleue', vehicule_id: null, parent_section_id: sac.id });
    const phare = await Elements.create({ name: 'Phare', section_id: cellule.id });
    const tensiometre = await Elements.create({ name: 'Tensiomètre', section_id: sac.id });
    const thermometre = await Elements.create({ name: 'Thermomètre', section_id: poche.id, quantite: 2 });

    return {
        garde1: garde1.id, garde2: garde2.id, admin: admin.id, user: user.id, vehicule: vehicule.id,
        cellule: cellule.id, sac: sac.id, poche: poche.id,
        phare: phare.id, tensiometre: tensiometre.id, thermometre: thermometre.id,
    };
}

/** Se connecte via la vraie route de login et renvoie le cookie de session à rejouer. */
export async function login(email: string, password = PASSWORD): Promise<string[]> {
    const res = await request(app).post('/api/auth/login').send({ email, password }).expect(200);
    return res.get('Set-Cookie')!;
}
