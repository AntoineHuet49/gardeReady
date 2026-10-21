import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpCode } from '~~/Helpers/HttpCode';
import { GardesRepository } from '~~/Repositories/GardeRepository';
import { VehiculeAssignmentsRepository } from '~~/Repositories/VehiculeAssignmentsRepository';
import { VehiculeAssignmentsService } from '~~/Services/VehiculeAssignmentsService';
import type { TUserPayload } from '~~/Types/User';

vi.mock('~~/Repositories/GardeRepository', () => ({ GardesRepository: { GetRotation: vi.fn(), GetAll: vi.fn() } }));
vi.mock('~~/Repositories/VehiculeAssignmentsRepository', () => ({
    VehiculeAssignmentsRepository: { GetBetween: vi.fn(), ReplaceWeek: vi.fn(), CountVehicules: vi.fn() },
}));

const gardesRepo = vi.mocked(GardesRepository);
const repo = vi.mocked(VehiculeAssignmentsRepository);

// Référence 02/10/2026 : Garde 1 (responsable #10, membres 10 et 11), puis Garde 2 (responsable #20)
const gardes = [
    { numero: 1, responsable: 10, users: [{ id: 10 }, { id: 11 }] },
    { numero: 2, responsable: 20, users: [{ id: 20 }] },
];
const as = (id: number, role = 'user') => ({ id, role } as TUserPayload);
const SEMAINE_G1 = '2026-10-02';

beforeEach(() => {
    vi.clearAllMocks();
    gardesRepo.GetRotation.mockResolvedValue({ id: 1, reference_date: '2026-10-02' });
    gardesRepo.GetAll.mockResolvedValue(gardes as never);
    repo.CountVehicules.mockImplementation(async (ids) => ids.length);
    repo.GetBetween.mockResolvedValue([]);
});

describe('replaceWeek', () => {
    it('le responsable de la garde de service assigne ses membres (doublons retirés)', async () => {
        const result = await VehiculeAssignmentsService.replaceWeek(
            SEMAINE_G1,
            [{ vehicule_id: 1, user_ids: [10, 11, 11] }, { vehicule_id: 1, user_ids: [10] }],
            as(10),
        );
        expect(result.success).toBe(true);
        expect(repo.ReplaceWeek).toHaveBeenCalledWith(SEMAINE_G1, [
            { vehicule_id: 1, user_id: 10 },
            { vehicule_id: 1, user_id: 11 },
        ]);
    });

    it.each(['admin', 'superAdmin'])('un %s peut assigner même sans être responsable', async (role) => {
        expect((await VehiculeAssignmentsService.replaceWeek(SEMAINE_G1, [], as(99, role))).success).toBe(true);
        expect(repo.CountVehicules).not.toHaveBeenCalled();
    });

    it('403 pour le responsable d’une autre garde', async () => {
        const result = await VehiculeAssignmentsService.replaceWeek(SEMAINE_G1, [], as(20));
        expect(result).toMatchObject({ success: false, errors: HttpCode.Forbidden });
        expect(repo.ReplaceWeek).not.toHaveBeenCalled();
    });

    it('la semaine suivante est celle de la Garde 2', async () => {
        expect((await VehiculeAssignmentsService.replaceWeek('2026-10-09', [], as(20))).success).toBe(true);
    });

    it('refuse un agent qui n’est pas membre de la garde de service', async () => {
        const result = await VehiculeAssignmentsService.replaceWeek(SEMAINE_G1, [{ vehicule_id: 1, user_ids: [20] }], as(10));
        expect(result).toMatchObject({ success: false, errors: HttpCode.BadRequest });
        expect(result.message).toContain('Garde 1');
    });

    it('refuse un véhicule inexistant', async () => {
        repo.CountVehicules.mockResolvedValue(0);
        const result = await VehiculeAssignmentsService.replaceWeek(SEMAINE_G1, [{ vehicule_id: 5, user_ids: [10] }], as(10));
        expect(result).toMatchObject({ success: false, message: 'Véhicule introuvable' });
    });

    it('échoue si la rotation n’est pas configurée ou s’il n’y a aucune garde', async () => {
        gardesRepo.GetRotation.mockResolvedValueOnce(null);
        expect((await VehiculeAssignmentsService.replaceWeek(SEMAINE_G1, [], as(1, 'admin'))).success).toBe(false);
        gardesRepo.GetAll.mockResolvedValueOnce([]);
        expect((await VehiculeAssignmentsService.replaceWeek(SEMAINE_G1, [], as(1, 'admin'))).success).toBe(false);
    });
});

describe('getBetween', () => {
    it('enveloppe les assignations du repository dans un OperationResult', async () => {
        repo.GetBetween.mockResolvedValue([{ id: 1 }] as never);
        expect(await VehiculeAssignmentsService.getBetween('2026-10-02', '2026-10-09')).toMatchObject({ success: true, data: [{ id: 1 }] });
    });
});
