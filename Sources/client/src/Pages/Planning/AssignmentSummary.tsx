import { Garde, VehiculeAssignment } from "../../Types/Garde";
import { Vehicule } from "../../Types/Vehicule";

type AssignmentSummaryProps = {
    garde: Garde;
    vehicules: Vehicule[];
    assignments: VehiculeAssignment[]; // assignations de cette semaine uniquement
};

// « VSAV 1 → Jean Dupont, Paul Martin » par véhicule, + alerte sur les véhicules sans agent.
// Un agent qui n'est plus membre de la garde (rotation ou garde modifiée) apparaît barré.
function AssignmentSummary({ garde, vehicules, assignments }: AssignmentSummaryProps) {
    const memberIds = new Set(garde.users?.map((u) => u.id));
    const covered = vehicules.filter((v) => assignments.some((a) => a.vehicule_id === v.id && memberIds.has(a.user_id)));
    const uncovered = vehicules.length - covered.length;
    const assignedVehicules = vehicules.filter((v) => assignments.some((a) => a.vehicule_id === v.id));

    return (
        <div className="flex flex-col gap-1 text-sm">
            {assignedVehicules.map((v) => (
                <p key={v.id}>
                    <span className="font-semibold">{v.name}</span>
                    {" → "}
                    {assignments.filter((a) => a.vehicule_id === v.id).map((a, i) => (
                        <span key={a.user_id}>
                            {i > 0 && ", "}
                            {memberIds.has(a.user_id) ? (
                                `${a.user.firstname} ${a.user.lastname}`
                            ) : (
                                <span className="line-through opacity-60" title="N'est plus membre de cette garde">
                                    {a.user.firstname} {a.user.lastname} (hors garde)
                                </span>
                            )}
                        </span>
                    ))}
                </p>
            ))}
            {vehicules.length > 0 && uncovered > 0 && (
                <span className="badge badge-warning badge-sm">
                    {uncovered === vehicules.length
                        ? "Aucun véhicule assigné"
                        : `${uncovered} véhicule${uncovered > 1 ? "s" : ""} sans agent`}
                </span>
            )}
        </div>
    );
}

export default AssignmentSummary;
