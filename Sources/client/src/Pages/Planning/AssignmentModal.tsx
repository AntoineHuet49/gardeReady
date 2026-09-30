import { useEffect, useRef, useState } from "react";
import { addDays, PRISE_DE_GARDE_HOUR, toDateOnly } from "../../App/utils/planning";
import { useReplaceWeekAssignments, useVehiculeAssignments } from "../../hooks/useVehiculeAssignments";
import { VehiculeAssignment } from "../../Types/Garde";
import { Vehicule } from "../../Types/Vehicule";
import { formatDay, gardeColor, Shift } from "./shared";

type Selection = Record<number, number[]>; // vehicule_id → user_ids

type AssignmentModalProps = {
    shift: Shift | null;
    vehicules: Vehicule[];
    gardesCount: number;
    onClose: () => void;
};

function AssignmentModal({ shift, vehicules, gardesCount, onClose }: AssignmentModalProps) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        if (shift) ref.current?.showModal();
    }, [shift]);

    return (
        <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
            {shift && (
                <AssignmentForm
                    key={shift.start.toISOString()}
                    shift={shift}
                    vehicules={vehicules}
                    gardesCount={gardesCount}
                    close={() => ref.current?.close()}
                />
            )}
            <form method="dialog" className="modal-backdrop">
                <button>Fermer</button>
            </form>
        </dialog>
    );
}

type AssignmentFormProps = Omit<AssignmentModalProps, "shift" | "onClose"> & { shift: Shift; close: () => void };

function AssignmentForm({ shift, vehicules, gardesCount, close }: AssignmentFormProps) {
    const shiftDate = toDateOnly(shift.start);
    // Dernière semaine de la même garde : un tour complet de rotation plus tôt
    const previousStart = addDays(shift.start, -7 * gardesCount);
    const previousDate = toDateOnly(previousStart);
    const { assignments, isLoading } = useVehiculeAssignments(shiftDate, shiftDate);
    const { assignments: previous } = useVehiculeAssignments(previousDate, previousDate);
    const save = useReplaceWeekAssignments();

    const members = shift.garde.users ?? [];
    const memberIds = new Set(members.map((u) => u.id));
    // Ne garde que les membres actuels de la garde et les véhicules existants
    const toSelection = (rows: VehiculeAssignment[]): Selection =>
        Object.fromEntries(vehicules.map((v) => [
            v.id,
            rows.filter((a) => a.vehicule_id === v.id && memberIds.has(a.user_id)).map((a) => a.user_id),
        ]));

    // Tant que rien n'est modifié, la sélection reflète les assignations enregistrées
    const [edited, setEdited] = useState<Selection | null>(null);
    const selection = edited ?? toSelection(assignments);
    const previousSelection = toSelection(previous);
    const canCopy = Object.values(previousSelection).some((ids) => ids.length > 0);

    const toggle = (vehiculeId: number, userId: number) => {
        const ids = selection[vehiculeId] ?? [];
        setEdited({ ...selection, [vehiculeId]: ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId] });
    };

    const submit = () =>
        save.mutate(
            {
                shiftDate,
                assignments: Object.entries(selection)
                    .filter(([, ids]) => ids.length > 0)
                    .map(([vehicule_id, user_ids]) => ({ vehicule_id: Number(vehicule_id), user_ids })),
            },
            { onSuccess: close }
        );

    return (
        // Même principe que la modale des membres : seule la liste défile, en-tête et actions restent visibles
        <div className="modal-box flex flex-col max-h-[85dvh] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="inline-block size-4 rounded-full" style={{ backgroundColor: gardeColor(shift.garde.color) }} />
                Véhicules à vérifier · Garde {shift.garde.numero}
            </h3>
            <p className="text-sm opacity-80 mt-1">Prise de garde {formatDay(shift.start)} {PRISE_DE_GARDE_HOUR}h</p>

            {canCopy && (
                <button type="button" className="btn btn-ghost btn-sm self-start mt-2" onClick={() => setEdited(previousSelection)}>
                    ↺ Reprendre la semaine du {formatDay(previousStart)}
                </button>
            )}

            <div className="min-h-0 overflow-y-auto overscroll-contain mt-3 flex flex-col gap-3">
                {isLoading ? (
                    <span className="loading loading-spinner self-center" />
                ) : vehicules.length === 0 ? (
                    <p className="text-sm opacity-70">Aucun véhicule n'est configuré.</p>
                ) : members.length === 0 ? (
                    <p className="text-sm opacity-70">Aucun membre dans cette garde.</p>
                ) : (
                    vehicules.map((v) => (
                        <fieldset key={v.id} className="fieldset bg-base-200 rounded-box p-3">
                            <legend className="fieldset-legend">
                                {v.name}
                                {(selection[v.id]?.length ?? 0) === 0 && <span className="badge badge-warning badge-xs">sans agent</span>}
                            </legend>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {members.map((u) => (
                                    <label key={u.id} className="label cursor-pointer text-base-content">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary"
                                            checked={selection[v.id]?.includes(u.id) ?? false}
                                            onChange={() => toggle(v.id, u.id)}
                                        />
                                        {u.firstname} {u.lastname}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    ))
                )}
            </div>

            <div className="modal-action mt-4">
                <button type="button" className="btn" onClick={close}>Annuler</button>
                <button type="button" className="btn btn-primary" onClick={submit} disabled={isLoading || save.isPending}>
                    {save.isPending && <span className="loading loading-spinner loading-sm" />}
                    Enregistrer
                </button>
            </div>
        </div>
    );
}

export default AssignmentModal;
