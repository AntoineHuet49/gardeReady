import { useEffect, useRef } from "react";

export type PendingConfirm = { message: string; onConfirm: () => void } | null;

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
                <h3 className="font-bold text-lg">Confirmer la suppression</h3>
                <p className="py-4">{pending?.message}</p>
                <form method="dialog" className="modal-action">
                    <button className="btn">Annuler</button>
                    <button className="btn btn-error" onClick={pending?.onConfirm}>
                        Supprimer
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
