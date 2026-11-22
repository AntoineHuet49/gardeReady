import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpCode } from '~~/Helpers/HttpCode';
import { VehiculeKilometragesRepository } from '~~/Repositories/VehiculeKilometragesRepository';
import { VehiculeKilometragesService } from '~~/Services/VehiculeKilometragesService';

vi.mock('~~/Repositories/VehiculeKilometragesRepository', () => ({
    VehiculeKilometragesRepository: { GetByVehicule: vi.fn(), VehiculeExists: vi.fn(), Create: vi.fn() },
}));
const repo = vi.mocked(VehiculeKilometragesRepository);

beforeEach(() => {
    vi.clearAllMocks();
    repo.VehiculeExists.mockResolvedValue(true);
});

describe('VehiculeKilometragesService', () => {
    it('add : retire les espaces du motif et stocke null si vide', async () => {
        await VehiculeKilometragesService.add(1, 2, 500, '  Manœuvre ');
        expect(repo.Create).toHaveBeenCalledWith({ vehicule_id: 1, user_id: 2, kilometrage: 500, motif: 'Manœuvre' });
        await VehiculeKilometragesService.add(1, 2, 500, '   ');
        expect(repo.Create).toHaveBeenLastCalledWith({ vehicule_id: 1, user_id: 2, kilometrage: 500, motif: null });
    });

    it('véhicule inexistant : 404 sans écriture', async () => {
        repo.VehiculeExists.mockResolvedValue(false);
        const result = await VehiculeKilometragesService.add(1, 2, 500);
        expect(result.success).toBe(false);
        expect(result.errors).toBe(HttpCode.NotFound);
        expect(repo.Create).not.toHaveBeenCalled();
        expect((await VehiculeKilometragesService.getHistory(1)).errors).toBe(HttpCode.NotFound);
    });
});
