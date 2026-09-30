import { OperationResult } from "~~/Helpers/OperationResult";
import { HttpCode } from "~~/Helpers/HttpCode";
import { GardesRepository } from "~~/Repositories/GardeRepository";
import { VehiculeAssignmentsRepository } from "~~/Repositories/VehiculeAssignmentsRepository";
import { TUserPayload } from "~~/Types/User";
import { gardeIndexForShift } from "~~/Utils/GardeRotation";

export type WeekAssignmentsDto = { vehicule_id: number; user_ids: number[] }[];

export class VehiculeAssignmentsService {
    public static async getBetween(from: string, to: string) {
        return OperationResult.ok(await VehiculeAssignmentsRepository.GetBetween(from, to));
    }

    /**
     * Remplace les assignations de la semaine `shiftDate`. Autorisé aux admins, et au responsable
     * de la garde de service cette semaine-là ; seuls les membres de cette garde peuvent être assignés.
     */
    public static async replaceWeek(shiftDate: string, assignments: WeekAssignmentsDto, requester: TUserPayload) {
        const rotation = await GardesRepository.GetRotation();
        const gardes = await GardesRepository.GetAll(true);
        if (!rotation || gardes.length === 0) {
            return OperationResult.fail("Le planning des gardes n'est pas configuré", HttpCode.BadRequest);
        }
        const garde = gardes[gardeIndexForShift(shiftDate, rotation.reference_date, gardes.length)];

        const isAdmin = requester.role === "admin" || requester.role === "superAdmin";
        if (!isAdmin && garde.responsable !== requester.id) {
            return OperationResult.fail("Seuls les admins et le responsable de la garde peuvent assigner les véhicules", HttpCode.Forbidden);
        }

        const memberIds = new Set((garde.users ?? []).map((u) => u.id));
        const rows = assignments.flatMap((a) => a.user_ids.map((user_id) => ({ vehicule_id: a.vehicule_id, user_id })));
        if (rows.some((row) => !memberIds.has(row.user_id))) {
            return OperationResult.fail(`Seuls les membres de la Garde ${garde.numero} peuvent être assignés cette semaine`, HttpCode.BadRequest);
        }

        const vehiculeIds = [...new Set(assignments.map((a) => a.vehicule_id))];
        if (vehiculeIds.length > 0 && (await VehiculeAssignmentsRepository.CountVehicules(vehiculeIds)) !== vehiculeIds.length) {
            return OperationResult.fail("Véhicule introuvable", HttpCode.BadRequest);
        }

        // Dédoublonnage (contrainte unique shift_date / vehicule / agent)
        const unique = [...new Map(rows.map((row) => [`${row.vehicule_id}-${row.user_id}`, row])).values()];
        await VehiculeAssignmentsRepository.ReplaceWeek(shiftDate, unique);
        return OperationResult.ok(await VehiculeAssignmentsRepository.GetBetween(shiftDate, shiftDate));
    }
}
