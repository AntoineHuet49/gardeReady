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
import { canAssignVehicules, formatDay, gardeColor, responsableName, Shift, shiftEnd } from "./shared";

function RotationModal({ open, onClose, firstGarde, referenceDate }: { open: boolean; onClose: () => void; firstGarde?: Garde; referenceDate?: string }) {
    const ref = useRef<HTMLDialogElement>(null);
    const { updateRotation } = useGardeRotation();
    const [value, setValue] = useState(referenceDate ?? "");
    useEffect(() => setValue(referenceDate ?? ""), [referenceDate, open]);
    useEffect(() => {
        if (open) ref.current?.showModal();
        else ref.current?.close();
    }, [open]);

    const isFriday = value !== "" && parseDateOnly(value).getDay() === 5;

    return (
        <dialog ref={ref} className="modal" onClose={onClose}>
            <form
                className="modal-box"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (isFriday) updateRotation.mutate(value, { onSuccess: onClose });
                }}
            >
                <h3 className="font-bold text-lg">Rotation des gardes</h3>
                <fieldset className="fieldset mt-2">
                    <div className="join">
                        <input
                            type="date"
                            aria-label="Date de référence de la rotation"
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
                <div className="modal-action">
                    <button type="button" className="btn" onClick={onClose}>Fermer</button>
                </div>
            </form>
            <form method="dialog" className="modal-backdrop">
                <button>Fermer</button>
            </form>
        </dialog>
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
    const [rotationOpen, setRotationOpen] = useState(false);
    const { data: vehiculesResponse } = useQuery({ queryKey: ["vehicules"], queryFn: () => getAllVehicules() });
    const vehicules = vehiculesResponse?.data ?? [];
    // superAdmin : toutes les gardes ; admin / responsable : uniquement la leur (règle vérifiée aussi côté API)
    const canAssign = (garde: Garde) => canAssignVehicules(user, garde);

    if (gardesLoading || rotationLoading) return <Loader />;
    if (gardesError || rotationError) {
        return <Alert type="error" display={true} message="Impossible de charger le planning des gardes" />;
    }

    const myGardeId = gardes.find((g) => g.users?.some((u) => u.id === user?.id))?.id ?? user?.garde_id;
    const viewProps = { gardes, referenceDate: rotation?.reference_date ?? "", myGardeId, onSelect: setSelected };

    return (
        <div className="container max-w-4xl flex flex-col items-center p-4">
            {isAdmin && (
                <div className="w-full flex justify-end mb-2">
                    <button type="button" className="btn btn-ghost btn-sm btn-circle" aria-label="Paramètres de rotation des gardes" onClick={() => setRotationOpen(true)}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-6" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </button>
                </div>
            )}

            {gardes.length === 0 ? (
                <p className="text-center text-base-content/70 py-8">Aucune garde n'est configurée pour le moment.</p>
            ) : !rotation ? (
                <p className="text-center text-base-content/70 py-8">
                    Planning non configuré{isAdmin ? " : renseignez la date de référence via l'engrenage ci-dessus." : "."}
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

            {isAdmin && <RotationModal open={rotationOpen} onClose={() => setRotationOpen(false)} firstGarde={gardes[0]} referenceDate={rotation?.reference_date} />}
            <GardeModal shift={selected} vehicules={vehicules} onClose={() => setSelected(null)} />
            <AssignmentModal shift={assigning} vehicules={vehicules} gardesCount={gardes.length} onClose={() => setAssigning(null)} />
        </div>
    );
}

export default Planning;
