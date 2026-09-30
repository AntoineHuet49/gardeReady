import { useEffect, useRef, useState } from "react";
import { useUser } from "../../App/Provider/UserProvider";
import { useGardes } from "../../hooks/useGardes";
import { useGardeRotation } from "../../hooks/useGardeRotation";
import { parseDateOnly, PRISE_DE_GARDE_HOUR, RELEVE_HOUR } from "../../App/utils/planning";
import { Garde } from "../../Types/Garde";
import Loader from "../../Components/Loader/Loader";
import Alert from "../../Components/Alert/Alert";
import MonthView from "./MonthView";
import ListView from "./ListView";
import { formatDay, gardeColor, responsableName, Shift, shiftEnd } from "./shared";

function RotationForm({ firstGarde, referenceDate }: { firstGarde?: Garde; referenceDate?: string }) {
    const { updateRotation } = useGardeRotation();
    const [value, setValue] = useState(referenceDate ?? "");
    useEffect(() => setValue(referenceDate ?? ""), [referenceDate]);

    const isFriday = value !== "" && parseDateOnly(value).getDay() === 5;

    return (
        <form
            className="card bg-base-100 border border-base-content/10 w-full p-4 mb-6"
            onSubmit={(e) => {
                e.preventDefault();
                if (isFriday) updateRotation.mutate(value);
            }}
        >
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Rotation des gardes (admin)</legend>
                <div className="join">
                    <input
                        type="date"
                        className="input join-item"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        aria-invalid={value !== "" && !isFriday}
                        required
                    />
                    <button type="submit" className="btn btn-primary join-item" disabled={!isFriday || updateRotation.isPending}>
                        {updateRotation.isPending && <span className="loading loading-spinner loading-sm" />}
                        Enregistrer
                    </button>
                </div>
                <p className={`label text-wrap ${value !== "" && !isFriday ? "text-error" : ""}`}>
                    {value !== "" && !isFriday
                        ? "Choisissez un vendredi."
                        : `Vendredi où la Garde ${firstGarde?.numero ?? 1} prend son service (relève ${RELEVE_HOUR}h). Les autres semaines suivent l'ordre des numéros.`}
                </p>
            </fieldset>
        </form>
    );
}

function GardeModal({ shift, onClose }: { shift: Shift | null; onClose: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        if (shift) ref.current?.showModal();
    }, [shift]);

    return (
        <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
            {shift && (
                <div className="modal-box">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span className="inline-block size-4 rounded-full" style={{ backgroundColor: gardeColor(shift.garde.color) }} />
                        Garde {shift.garde.numero}
                    </h3>
                    <p className="text-sm opacity-80 mt-1">
                        {formatDay(shift.start)} {RELEVE_HOUR}h → {formatDay(shiftEnd(shift.start))} {RELEVE_HOUR}h · prise de garde {PRISE_DE_GARDE_HOUR}h
                    </p>
                    <p className="mt-4">
                        <span className="font-semibold">Responsable : </span>
                        {responsableName(shift.garde) ?? "non défini"}
                    </p>
                    <h4 className="font-semibold mt-4 mb-2">Membres ({shift.garde.users?.length ?? 0})</h4>
                    {shift.garde.users?.length ? (
                        <ul className="list bg-base-200 rounded-box">
                            {shift.garde.users.map((u) => (
                                <li key={u.id} className="list-row py-2">
                                    {u.firstname} {u.lastname}
                                    {u.id === shift.garde.responsable && <span className="badge badge-sm badge-primary">Responsable</span>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm opacity-70">Aucun membre dans cette garde.</p>
                    )}
                    <div className="modal-action">
                        <button type="button" className="btn" onClick={() => ref.current?.close()}>Fermer</button>
                    </div>
                </div>
            )}
            <form method="dialog" className="modal-backdrop">
                <button>Fermer</button>
            </form>
        </dialog>
    );
}

function Planning() {
    const { user, isAdmin } = useUser();
    const { gardes = [], isLoading: gardesLoading, error: gardesError } = useGardes();
    const { rotation, isLoading: rotationLoading, error: rotationError } = useGardeRotation();
    const [view, setView] = useState<"month" | "list">("month");
    const [selected, setSelected] = useState<Shift | null>(null);

    if (gardesLoading || rotationLoading) return <Loader />;
    if (gardesError || rotationError) {
        return <Alert type="error" display={true} message="Impossible de charger le planning des gardes" />;
    }

    const myGardeId = gardes.find((g) => g.users?.some((u) => u.id === user?.id))?.id ?? user?.garde_id;
    const viewProps = { gardes, referenceDate: rotation?.reference_date ?? "", myGardeId, onSelect: setSelected };

    return (
        <div className="container max-w-4xl flex flex-col items-center p-4">
            {isAdmin && <RotationForm firstGarde={gardes[0]} referenceDate={rotation?.reference_date} />}

            {gardes.length === 0 ? (
                <p className="text-center text-base-content/70 py-8">Aucune garde n'est configurée pour le moment.</p>
            ) : !rotation ? (
                <p className="text-center text-base-content/70 py-8">
                    Planning non configuré{isAdmin ? " : renseignez la date de référence ci-dessus." : "."}
                </p>
            ) : (
                <>
                    <div role="tablist" className="tabs tabs-box mb-4">
                        <button type="button" role="tab" className={`tab ${view === "month" ? "tab-active" : ""}`} onClick={() => setView("month")}>
                            Mois
                        </button>
                        <button type="button" role="tab" className={`tab ${view === "list" ? "tab-active" : ""}`} onClick={() => setView("list")}>
                            Liste
                        </button>
                    </div>
                    {view === "month" ? <MonthView {...viewProps} /> : <ListView {...viewProps} />}
                </>
            )}

            <GardeModal shift={selected} onClose={() => setSelected(null)} />
        </div>
    );
}

export default Planning;
