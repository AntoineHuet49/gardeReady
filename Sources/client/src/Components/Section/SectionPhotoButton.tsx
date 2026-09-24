import { useRef, useState } from "react";
import { Section } from "../../Types/Section";
import { sectionPhotoUrl } from "../../App/utils/Api/Sections";

type SectionPhotoButtonProps = {
    section: Section;
    className?: string;
};

// Bouton qui ouvre la photo de la section dans une modale DaisyUI.
// L'image n'est chargée qu'à l'ouverture ; le paramètre ?v= évite d'afficher une ancienne photo remplacée.
const SectionPhotoButton = ({ section, className = "btn-xs" }: SectionPhotoButtonProps) => {
    const ref = useRef<HTMLDialogElement>(null);
    const [openedAt, setOpenedAt] = useState<number | null>(null);

    const open = () => {
        setOpenedAt(Date.now());
        ref.current?.showModal();
    };
    const close = () => ref.current?.close();

    return (
        <>
            <button type="button" className={`btn btn-outline ${className}`} onClick={open} title="Voir la photo de la section">
                📷 Photo
            </button>
            {/* Pas de <form method="dialog"> : ce composant peut être rendu dans le formulaire de vérification */}
            <dialog ref={ref} className="modal" onClose={() => setOpenedAt(null)}>
                <div className="modal-box max-w-3xl">
                    <h3 className="font-bold text-lg mb-4">{section.name}</h3>
                    {openedAt && (
                        <img
                            src={`${sectionPhotoUrl(section.id)}?v=${openedAt}`}
                            alt={`Photo de la section ${section.name}`}
                            className="w-full max-h-[70vh] object-contain rounded-lg"
                        />
                    )}
                    <div className="modal-action">
                        <button type="button" className="btn" onClick={close}>
                            Fermer
                        </button>
                    </div>
                </div>
                <div className="modal-backdrop" onClick={close} />
            </dialog>
        </>
    );
};

export default SectionPhotoButton;
