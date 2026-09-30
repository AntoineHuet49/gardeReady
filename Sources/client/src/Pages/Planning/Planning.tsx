import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../App/Provider/UserProvider";
import { useGardes } from "../../hooks/useGardes";
import { useGardeRotation } from "../../hooks/useGardeRotation";
import { useVehiculeAssignments } from "../../hooks/useVehiculeAssignments";
import { getAllVehicules } from "../../App/utils/Api/Vehicules";
import { parseDateOnly, PRISE_DE_GARDE_HOUR, RELEVE_HOUR, toDateOnly } from "../../App/utils/planning";
import { Garde } from "../../Types/Garde";
import { Vehicule } from "../../Types/Vehicule";
import Loader from "../../Components/Loader/Loader";
import Alert from "../../Components/Alert/Alert";
import MonthView from "./MonthView";
import ListView from "./ListView";
import AssignmentModal from "./AssignmentModal";
import AssignmentSummary from "./AssignmentSummary";
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

function GardeModal({ shift, vehicules, onClose }: { shift: Shift | null; vehicules: Vehicule[]; onClose: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        if (shift) ref.current?.showModal();
    }, [shift]);
    const shiftDate = shift ? toDateOnly(shift.start) : "";
    const { assignments } = useVehiculeAssignments(shiftDate, shiftDate, shift !== null);

    return (
        <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
            {shift && (
                // Hauteur en dvh (pas vh) : sur mobile la barre du navigateur masquait le bas de la modale.
                // Seuls véhicules et membres défilent ; en-tête et bouton Fermer restent visibles.
                <div className="modal-box flex flex-col max-h-[85dvh] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
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
                    <div className="min-h-0 overflow-y-auto overscroll-contain">
                        {vehicules.length > 0 && (
                            <>
                                <h4 className="font-semibold mt-4 mb-2">Véhicules à vérifier ({PRISE_DE_GARDE_HOUR}h)</h4>
                                <AssignmentSummary garde={shift.garde} vehicules={vehicules} assignments={assignments} />
                            </>
                        )}
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
                    </div>
                    <div className="modal-action mt-4">
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
    const [assigning, setAssigning] = useState<Shift | null>(null);
    const { data: vehiculesResponse } = useQuery({ queryKey: ["vehicules"], queryFn: () => getAllVehicules() });
    const vehicules = vehiculesResponse?.data ?? [];
    // Admins : toutes les gardes ; responsable : uniquement la sienne (règle vérifiée aussi côté API)
    const canAssign = (garde: Garde) => isAdmin || (user !== null && garde.responsable === user.id);

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
                    {view === "month" ? (
                        <MonthView {...viewProps} />
                    ) : (
                        <ListView {...viewProps} vehicules={vehicules} canAssign={canAssign} onAssign={setAssigning} />
                    )}
                </>
            )}

            <GardeModal shift={selected} vehicules={vehicules} onClose={() => setSelected(null)} />
            <AssignmentModal shift={assigning} vehicules={vehicules} gardesCount={gardes.length} onClose={() => setAssigning(null)} />
        </div>
    );
}

export default Planning;
