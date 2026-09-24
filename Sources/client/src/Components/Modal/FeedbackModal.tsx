import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FeedbackType, sendFeedback } from "../../App/utils/Api/Feedback";

const choices: { type: FeedbackType; emoji: string; label: string; placeholder: string }[] = [
    {
        type: "bug",
        emoji: "🐞",
        label: "Signaler un problème",
        placeholder: "Qu'est-ce qui ne marche pas ? Qu'étiez-vous en train de faire ?",
    },
    {
        type: "idea",
        emoji: "💡",
        label: "Proposer une idée",
        placeholder: "Qu'est-ce qui vous faciliterait la vie ?",
    },
];

function FeedbackModal() {
    const ref = useRef<HTMLDialogElement>(null);
    const [type, setType] = useState<FeedbackType>("bug");
    const [message, setMessage] = useState("");

    const mutation = useMutation({
        mutationFn: sendFeedback,
        onSuccess: () => {
            toast.success("Merci ! Votre retour a bien été envoyé.");
            setMessage("");
            ref.current?.close();
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Impossible d'envoyer votre retour, réessayez plus tard.");
        },
    });

    const current = choices.find((c) => c.type === type)!;
    const canSend = message.trim().length >= 5 && !mutation.isPending;

    return (
        <>
            <button
                type="button"
                className="btn btn-ghost"
                aria-label="Signaler un problème ou proposer une idée"
                onClick={() => ref.current?.showModal()}
            >
                💬 <span className="hidden sm:inline">Un problème ? Une idée ?</span>
            </button>
            <dialog ref={ref} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Votre avis nous aide à améliorer l'application</h3>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (canSend) mutation.mutate({ type, message: message.trim() });
                        }}
                    >
                        <div className="grid grid-cols-2 gap-2 my-4" role="radiogroup" aria-label="Type de retour">
                            {choices.map((c) => (
                                <button
                                    key={c.type}
                                    type="button"
                                    role="radio"
                                    aria-checked={type === c.type}
                                    className={`btn h-auto py-3 flex-col ${type === c.type ? "btn-primary" : "btn-outline"}`}
                                    onClick={() => setType(c.type)}
                                >
                                    <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
                                    {c.label}
                                </button>
                            ))}
                        </div>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Décrivez-le avec vos mots</legend>
                            <textarea
                                className="textarea w-full h-32"
                                placeholder={current.placeholder}
                                value={message}
                                maxLength={5000}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                            <p className="label text-wrap">
                                Pas besoin de détails techniques. Ce message est public : n'indiquez ni nom, ni
                                téléphone, ni information personnelle.
                            </p>
                        </fieldset>
                        <div className="modal-action">
                            <button type="button" className="btn" onClick={() => ref.current?.close()}>
                                Annuler
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={!canSend}>
                                {mutation.isPending && <span className="loading loading-spinner loading-sm" />}
                                Envoyer
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>Fermer</button>
                </form>
            </dialog>
        </>
    );
}

export default FeedbackModal;
