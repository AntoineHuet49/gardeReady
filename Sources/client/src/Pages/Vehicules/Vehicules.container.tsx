import { useQuery } from "@tanstack/react-query";
import Vehicules from "./Vehicules";
import { Vehicule } from "../../Types/Vehicule";
import { useNavigate } from "react-router";
import { getAllVehicules } from "../../App/utils/Api/Vehicules";
import { useUser } from "../../App/Provider/UserProvider";
import { useVehiculeAssignments } from "../../hooks/useVehiculeAssignments";
import { shiftStartOf, toDateOnly } from "../../App/utils/planning";

function VehiculesContainer() {
    const {data, isLoading , error} = useQuery({
        queryKey: ["vehicules"],
        queryFn: () => getAllVehicules(),
    });
    const navigate = useNavigate();
    const { user } = useUser();

    // Véhicules assignés à l'agent connecté pour la semaine de garde en cours
    const currentShift = shiftStartOf(new Date());
    const shiftDate = toDateOnly(currentShift);
    const { assignments } = useVehiculeAssignments(shiftDate, shiftDate);
    const assignedIds = new Set(assignments.filter((a) => a.user_id === user?.id).map((a) => a.vehicule_id));

    // Collègues assignés au même véhicule (hors agent connecté)
    const colleagues = new Map<number, string[]>();
    for (const a of assignments) {
        if (assignedIds.has(a.vehicule_id) && a.user_id !== user?.id) {
            colleagues.set(a.vehicule_id, [...(colleagues.get(a.vehicule_id) ?? []), `${a.user.firstname} ${a.user.lastname}`]);
        }
    }

    const vehicules: Vehicule[] = data?.data || [];

    return (
        <Vehicules
            vehicules={vehicules}
            assignedIds={assignedIds}
            colleagues={colleagues}
            currentShift={currentShift}
            isLoading={isLoading}
            error={error}
            navigate={navigate}
        />
    );
}

export default VehiculesContainer;
