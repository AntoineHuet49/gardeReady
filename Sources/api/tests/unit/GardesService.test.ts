import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GardesRepository } from '~~/Repositories/GardeRepository';
import { GardesService } from '~~/Services/GardesService';

// GardesService délègue au repository et ne renvoie pas d'OperationResult :
// le tri par numero et l'inclusion du responsable sont vérifiés en intégration (gardes.test.ts).
vi.mock('~~/Repositories/GardeRepository', () => ({
    GardesRepository: {
        GetAll: vi.fn(),
        Create: vi.fn(),
        Delete: vi.fn(),
        UpdateResponsable: vi.fn(),
        GetRotation: vi.fn(),
        UpsertRotation: vi.fn(),
    },
}));

const repo = vi.mocked(GardesRepository);
beforeEach(() => vi.clearAllMocks());

describe('GardesService', () => {
    it('inclut les membres superAdmin seulement pour un superAdmin', async () => {
        await GardesService.getAllGardes('superAdmin');
        await GardesService.getAllGardes('admin');
        await GardesService.getAllGardes(undefined);
        expect(repo.GetAll.mock.calls).toEqual([[true], [false], [false]]);
    });

    it('transmet la création, la suppression et le changement de responsable', async () => {
        await GardesService.createGarde({ numero: 4, color: 'Bleu' });
        await GardesService.updateResponsable(1, null);
        await GardesService.deleteGarde(2);
        expect(repo.Create).toHaveBeenCalledWith({ numero: 4, color: 'Bleu' });
        expect(repo.UpdateResponsable).toHaveBeenCalledWith(1, null);
        expect(repo.Delete).toHaveBeenCalledWith(2);
    });

    it('lit et met à jour la date de référence de la rotation', async () => {
        repo.GetRotation.mockResolvedValue({ id: 1, reference_date: '2026-10-02' });
        expect(await GardesService.getRotation()).toEqual({ id: 1, reference_date: '2026-10-02' });
        await GardesService.updateRotation('2026-10-09');
        expect(repo.UpsertRotation).toHaveBeenCalledWith('2026-10-09');
    });
});
