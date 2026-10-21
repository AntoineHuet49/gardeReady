import { describe, expect, it } from 'vitest';
import { dbContext } from '~~/Utils/Database';

describe('base de test', () => {
    it('contient le schéma de initdb', async () => {
        const [rows] = await dbContext.query("SELECT to_regclass('public.vehicules') AS t");
        expect(rows).toEqual([{ t: 'vehicules' }]);
    });
});
