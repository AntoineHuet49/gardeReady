import { useState } from "react";
import { Garde } from "../../Types/Garde";
import { addDays, gardeForShift, PRISE_DE_GARDE_HOUR, RELEVE_HOUR, shiftStartOf } from "../../App/utils/planning";
import GardeBar from "./GardeBar";
import { formatDay, responsableName, Shift, shiftEnd } from "./shared";

type ListViewProps = {
    gardes: Garde[];
    referenceDate: string;
    myGardeId?: number;
    onSelect: (shift: Shift) => void;
};

const PAGE_SIZE = 8;

// Une carte par semaine de garde ; prévue pour accueillir plus tard l'assignation véhicule → agents
function ListView({ gardes, referenceDate, myGardeId, onSelect }: ListViewProps) {
    const [count, setCount] = useState(PAGE_SIZE);
    const current = shiftStartOf(new Date());

    const shifts = Array.from({ length: count }, (_, i) => {
        const start = addDays(current, i * 7);
        return { start, garde: gardeForShift(start, referenceDate, gardes) };
    }).filter((s): s is Shift => s.garde !== undefined);

    return (
        <div className="w-full flex flex-col gap-2">
            {shifts.map((shift, i) => (
                <GardeBar
                    key={shift.start.toISOString()}
                    shift={shift}
                    isMine={shift.garde.id === myGardeId}
                    onSelect={onSelect}
                    className="p-3 flex flex-wrap items-center gap-x-4 gap-y-1"
                >
                    <span className="font-semibold text-lg">Garde {shift.garde.numero}</span>
                    {i === 0 && <span className="badge badge-primary badge-sm">En cours</span>}
                    {shift.garde.id === myGardeId && <span className="badge badge-outline badge-sm">Ma garde</span>}
                    <span className="text-sm w-full sm:w-auto">
                        {formatDay(shift.start)} {RELEVE_HOUR}h → {formatDay(shiftEnd(shift.start))} {RELEVE_HOUR}h
                        <span className="opacity-70"> · prise de garde {PRISE_DE_GARDE_HOUR}h</span>
                    </span>
                    {responsableName(shift.garde) && (
                        <span className="text-sm opacity-80">Resp. {responsableName(shift.garde)}</span>
                    )}
                </GardeBar>
            ))}
            <button type="button" className="btn btn-ghost btn-sm self-center" onClick={() => setCount(count + PAGE_SIZE)}>
                Voir plus
            </button>
        </div>
    );
}

export default ListView;
