import { useEffect, useRef } from "react";

// title/confirmLabel : par défaut une suppression (bouton rouge) ; un autre libellé donne un bouton neutre
export type PendingConfirm = { message: string; onConfirm: () => void; title?: string; confirmLabel?: string } | null;

type ConfirmModalProps = {
    pending: PendingConfirm;
    onClose: () => void;
};

function ConfirmModal({ pending, onClose }: ConfirmModalProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (pending) ref.current?.showModal();
        else ref.current?.close();
    }, [pending]);

    return (
        <dialog ref={ref} className="modal" onClose={onClose}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">{pending?.title ?? "Confirmer la suppression"}</h3>
                <p className="py-4">{pending?.message}</p>
                <form method="dialog" className="modal-action">
                    <button className="btn">Annuler</button>
                    <button className={`btn ${pending?.confirmLabel ? "btn-primary" : "btn-error"}`} onClick={pending?.onConfirm}>
                        {pending?.confirmLabel ?? "Supprimer"}
                    </button>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>Fermer</button>
            </form>
        </dialog>
    );
}

export default ConfirmModal;
