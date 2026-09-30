import { useState } from "react";
import { Garde } from "../../Types/Garde";
import { Vehicule } from "../../Types/Vehicule";
import { addDays, gardeForShift, PRISE_DE_GARDE_HOUR, RELEVE_HOUR, shiftStartOf, toDateOnly } from "../../App/utils/planning";
import { useVehiculeAssignments } from "../../hooks/useVehiculeAssignments";
import AssignmentSummary from "./AssignmentSummary";
import { formatDay, gardeTint, responsableName, Shift, shiftEnd } from "./shared";

type ListViewProps = {
    gardes: Garde[];
    referenceDate: string;
    myGardeId?: number;
    onSelect: (shift: Shift) => void;
    vehicules: Vehicule[];
    canAssign: (garde: Garde) => boolean;
    onAssign: (shift: Shift) => void;
};

const PAGE_SIZE = 8;

// Une carte par semaine de garde, avec les agents assignés à la vérification des véhicules
function ListView({ gardes, referenceDate, myGardeId, onSelect, vehicules, canAssign, onAssign }: ListViewProps) {
    const [count, setCount] = useState(PAGE_SIZE);
    const current = shiftStartOf(new Date());

    const shifts = Array.from({ length: count }, (_, i) => {
        const start = addDays(current, i * 7);
        return { start, garde: gardeForShift(start, referenceDate, gardes) };
    }).filter((s): s is Shift => s.garde !== undefined);

    const { assignments } = useVehiculeAssignments(toDateOnly(current), toDateOnly(addDays(current, (count - 1) * 7)));

    return (
        <div className="w-full flex flex-col gap-2">
            {shifts.map((shift, i) => {
                const isMine = shift.garde.id === myGardeId;
                const weekAssignments = assignments.filter((a) => a.shift_date === toDateOnly(shift.start));
                return (
                    <div
                        key={shift.start.toISOString()}
                        className={`rounded-md border-l-4 ${isMine ? "ring-2 ring-primary" : ""}`}
                        style={gardeTint(shift.garde.color)}
                    >
                        <button
                            type="button"
                            onClick={() => onSelect(shift)}
                            className="w-full text-left p-3 pb-2 flex flex-wrap items-center gap-x-4 gap-y-1 cursor-pointer rounded-md hover:brightness-95"
                        >
                            <span className="font-semibold text-lg">Garde {shift.garde.numero}</span>
                            {i === 0 && <span className="badge badge-primary badge-sm">En cours</span>}
                            {isMine && <span className="badge badge-outline badge-sm">Ma garde</span>}
                            <span className="text-sm w-full sm:w-auto">
                                {formatDay(shift.start)} {RELEVE_HOUR}h → {formatDay(shiftEnd(shift.start))} {RELEVE_HOUR}h
                                <span className="opacity-70"> · prise de garde {PRISE_DE_GARDE_HOUR}h</span>
                            </span>
                            {responsableName(shift.garde) && (
                                <span className="text-sm opacity-80">Resp. {responsableName(shift.garde)}</span>
                            )}
                        </button>
                        <div className="px-3 pb-3 flex flex-wrap items-end justify-between gap-2">
                            <AssignmentSummary garde={shift.garde} vehicules={vehicules} assignments={weekAssignments} />
                            {canAssign(shift.garde) && vehicules.length > 0 && (
                                <button type="button" className="btn btn-sm btn-primary btn-outline" onClick={() => onAssign(shift)}>
                                    {weekAssignments.length > 0 ? "Modifier les véhicules" : "Assigner les véhicules"}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
            <button type="button" className="btn btn-ghost btn-sm self-center" onClick={() => setCount(count + PAGE_SIZE)}>
                Voir plus
            </button>
        </div>
    );
}

export default ListView;
