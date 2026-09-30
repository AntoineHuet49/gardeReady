import { VehiculeAssignment, WeekAssignments } from "../../../Types/Garde";
import { apiUrl } from "../constants";
import { instance } from "./axios";

/** Assignations des semaines dont le vendredi de relève est entre `from` et `to` (AAAA-MM-JJ, inclus). */
export function getVehiculeAssignments(from: string, to: string) {
    return instance.get<VehiculeAssignment[]>(apiUrl.vehiculeAssignments, { params: { from, to } }).then((response) => {
        return response.data;
    });
}

/** Remplace toutes les assignations de la semaine `shiftDate`. */
export function replaceWeekAssignments(shiftDate: string, assignments: WeekAssignments) {
    return instance.put<VehiculeAssignment[]>(`${apiUrl.vehiculeAssignments}/${shiftDate}`, { assignments }).then((response) => {
        return response.data;
    });
}
