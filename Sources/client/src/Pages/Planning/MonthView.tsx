import { useState } from "react";
import { Garde } from "../../Types/Garde";
import { addDays, gardeForShift, mondayOf, RELEVE_HOUR } from "../../App/utils/planning";
import GardeBar from "./GardeBar";
import { responsableName, Shift } from "./shared";

type MonthViewProps = {
    gardes: Garde[];
    referenceDate: string;
    myGardeId?: number;
    onSelect: (shift: Shift) => void;
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
// 14 demi-colonnes : la relève du vendredi 8h tombe au milieu de la colonne « Ven »
const HALF_DAY_GRID = { gridTemplateColumns: "repeat(14, minmax(0, 1fr))" };

function MonthView({ gardes, referenceDate, myGardeId, onSelect }: MonthViewProps) {
    const today = new Date();
    const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const firstMonday = mondayOf(month);
    const weekCount = Math.ceil((lastDay.getDate() + (month.getDay() + 6) % 7) / 7);
    const weeks = Array.from({ length: weekCount }, (_, i) => addDays(firstMonday, i * 7));

    const shiftAt = (start: Date): Shift | null => {
        const garde = gardeForShift(start, referenceDate, gardes);
        return garde ? { start, garde } : null;
    };

    const renderBar = (shift: Shift | null, gridColumn: string) =>
        shift && (
            <GardeBar
                shift={shift}
                isMine={shift.garde.id === myGardeId}
                onSelect={onSelect}
                className="px-2 py-1 text-xs sm:text-sm truncate"
                style={{ gridColumn }}
            >
                <span className="font-semibold">
                    <span className="sm:hidden">G{shift.garde.numero}</span>
                    <span className="hidden sm:inline">Garde {shift.garde.numero}</span>
                </span>
                {responsableName(shift.garde) && (
                    <span className="hidden md:inline opacity-80"> · {responsableName(shift.garde)}</span>
                )}
            </GardeBar>
        );

    return (
        <div className="w-full">
            <div className="flex items-center justify-between gap-2 mb-4">
                <button type="button" className="btn btn-ghost btn-sm" aria-label="Mois précédent"
                    onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                    ‹
                </button>
                <h2 className="text-lg sm:text-xl font-semibold capitalize">
                    {month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex gap-1">
                    <button type="button" className="btn btn-ghost btn-sm"
                        onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>
                        Aujourd'hui
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" aria-label="Mois suivant"
                        onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                        ›
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 text-center text-xs font-semibold opacity-70 pb-1 border-b border-base-300">
                {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
            </div>

            {weeks.map((monday) => {
                const friday = addDays(monday, 4);
                const incoming = new Date(friday.getFullYear(), friday.getMonth(), friday.getDate(), RELEVE_HOUR);
                return (
                    <div key={monday.toISOString()} className="border-b border-base-300 pb-2">
                        <div className="grid grid-cols-7 text-center text-sm py-1">
                            {WEEKDAYS.map((_, i) => {
                                const day = addDays(monday, i);
                                const isToday = day.toDateString() === today.toDateString();
                                const inMonth = day.getMonth() === month.getMonth();
                                return (
                                    <div key={i} className={inMonth ? "" : "opacity-40"}>
                                        <span className={isToday ? "inline-block min-w-7 rounded-full bg-primary text-primary-content" : ""}>
                                            {day.getDate()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="grid gap-1" style={HALF_DAY_GRID}>
                            {renderBar(shiftAt(addDays(incoming, -7)), "1 / 10")}
                            {renderBar(shiftAt(incoming), "10 / 15")}
                        </div>
                    </div>
                );
            })}
            <p className="text-xs opacity-70 mt-2">Relève le vendredi à 8h · prise de garde à 18h</p>
        </div>
    );
}

export default MonthView;
