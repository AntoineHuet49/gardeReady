import { beforeEach, describe, expect, it } from 'vitest';
import { DataTypes, Model, ModelStatic, QueryTypes } from 'sequelize';
import { Elements, GardeRotation, Gardes, Sections, Users, VehiculeAssignments, Vehicules } from '~~/Models';
import { dbContext } from '~~/Utils/Database';
import { seedDatabase } from './seed';

type Column = { table_name: string; column_name: string; is_nullable: 'YES' | 'NO'; character_maximum_length: number | null };
const models: ModelStatic<Model>[] = [Users, Gardes, GardeRotation, Vehicules, Sections, Elements, VehiculeAssignments];

async function columns(): Promise<Column[]> {
    return dbContext.query<Column>(
        "SELECT table_name, column_name, is_nullable, character_maximum_length FROM information_schema.columns WHERE table_schema = 'public'",
        { type: QueryTypes.SELECT },
    );
}

// Le schéma réel vient de Sources/database/initdb/init.sql (comme docker-compose) ; les modèles Sequelize doivent y correspondre.
describe('cohérence init.sql / modèles Sequelize', () => {
    it.each(models.map((m) => [m.tableName, m] as const))('%s : mêmes colonnes et même nullabilité', async (table, model) => {
        const db = (await columns()).filter((c) => c.table_name === table);
        const attributes = Object.values(model.getAttributes());

        expect(db.map((c) => c.column_name).sort()).toEqual(attributes.map((a) => a.field).sort());
        for (const attr of attributes) {
            const col = db.find((c) => c.column_name === attr.field)!;
            const allowNull = attr.primaryKey ? false : attr.allowNull !== false;
            expect({ colonne: attr.field, nullable: col.is_nullable === 'YES' }).toEqual({ colonne: attr.field, nullable: allowNull });
        }
    });

    it('longueurs des VARCHAR : seuls les écarts connus subsistent', async () => {
        const db = await columns();
        const ecarts: string[] = [];
        for (const model of models) {
            for (const attr of Object.values(model.getAttributes())) {
                if (!(attr.type instanceof DataTypes.STRING)) continue;
                const modelLength = (attr.type as unknown as { options: { length?: number } }).options.length ?? 255;
                const dbLength = db.find((c) => c.table_name === model.tableName && c.column_name === attr.field)!.character_maximum_length;
                if (modelLength !== dbLength) ecarts.push(`${model.tableName}.${attr.field}: modèle ${modelLength}, init.sql ${dbLength}`);
            }
        }
        // Écarts sans impact en prod (le schéma SQL fait foi) mais `sync({ alter: true })` en développement
        // élargit ces colonnes : les bases de dev divergent alors de init.sql. Aligner les modèles pour les supprimer.
        expect(ecarts.sort()).toEqual([
            'elements.name: modèle 255, init.sql 100',
            'users.role: modèle 50, init.sql 20',
            'vehicules.name: modèle 255, init.sql 100',
        ]);
    });
});

describe('contraintes de la base', () => {
    let ids: Awaited<ReturnType<typeof seedDatabase>>;
    beforeEach(async () => {
        ids = await seedDatabase();
    });

    const count = async (table: string) =>
        (await dbContext.query<{ n: number }>(`SELECT count(*)::int AS n FROM ${table}`, { type: QueryTypes.SELECT }))[0].n;

    it.each([
        ['les deux', `${1}, ${1}`],
        ['aucun des deux', 'NULL, NULL'],
    ])('CHECK XOR : une section avec %s (vehicule_id / parent_section_id) est refusée par Postgres', async (_label, values) => {
        await expect(
            dbContext.query(`INSERT INTO sections (name, vehicule_id, parent_section_id) VALUES ('X', ${values})`),
        ).rejects.toThrow(/check_section_root/);
    });

    it('le validateur Sequelize applique aussi le XOR', async () => {
        await expect(Sections.create({ name: 'X', vehicule_id: ids.vehicule, parent_section_id: ids.cellule })).rejects.toThrow(/section racine/);
        await expect(Sections.create({ name: 'X', vehicule_id: null, parent_section_id: null })).rejects.toThrow(/section racine/);
    });

    it('ON DELETE CASCADE : supprimer le véhicule supprime ses sections (3 niveaux) et leurs éléments', async () => {
        expect(await count('sections')).toBe(3);
        expect(await count('elements')).toBe(3);
        await Vehicules.destroy({ where: { id: ids.vehicule } });
        expect(await count('sections')).toBe(0);
        expect(await count('elements')).toBe(0);
    });

    it('ON DELETE SET NULL : supprimer le responsable garde la garde, sans responsable', async () => {
        await Users.destroy({ where: { id: ids.admin } });
        const garde = await Gardes.findByPk(ids.garde1);
        expect(garde).not.toBeNull();
        expect(garde!.responsable).toBeNull();
    });

    it('ON DELETE CASCADE : supprimer une garde supprime ses membres', async () => {
        await Gardes.destroy({ where: { id: ids.garde1 } });
        expect(await Users.count()).toBe(0);
    });

    it('garde_rotation et vehicule_assignments n’acceptent que des vendredis', async () => {
        await expect(dbContext.query("UPDATE garde_rotation SET reference_date = '2026-10-03'")).rejects.toThrow(/check/);
        await expect(
            dbContext.query(`INSERT INTO vehicule_assignments (shift_date, vehicule_id, user_id) VALUES ('2026-10-03', ${ids.vehicule}, ${ids.user})`),
        ).rejects.toThrow(/check/);
    });
});
