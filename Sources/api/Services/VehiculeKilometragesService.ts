import { HttpCode } from "~~/Helpers/HttpCode";
import { OperationResult } from "~~/Helpers/OperationResult";
import { VehiculeKilometragesRepository } from "~~/Repositories/VehiculeKilometragesRepository";

export class VehiculeKilometragesService {
    public static async getHistory(vehiculeId: number) {
        if (!(await VehiculeKilometragesRepository.VehiculeExists(vehiculeId))) {
            return OperationResult.fail("Véhicule introuvable", HttpCode.NotFound);
        }
        return OperationResult.ok(await VehiculeKilometragesRepository.GetByVehicule(vehiculeId));
    }

    public static async add(vehiculeId: number, userId: number, kilometrage: number, motif?: string) {
        if (!(await VehiculeKilometragesRepository.VehiculeExists(vehiculeId))) {
            return OperationResult.fail("Véhicule introuvable", HttpCode.NotFound);
        }
        const row = await VehiculeKilometragesRepository.Create({
            vehicule_id: vehiculeId, user_id: userId, kilometrage, motif: motif?.trim() || null,
        });
        return OperationResult.ok(row);
    }
}
