import { useEffect, useRef, useState } from "react";
import { Section } from "../../Types/Section";

export type MoveSectionTarget = { section: Section; vehiculeSections: Section[] } | null;

type MoveSectionModalProps = {
    target: MoveSectionTarget;
    onClose: () => void;
    onMove: (sectionId: number, parentSectionId: number | null) => void;
};

type Option = { id: number; name: string; depth: number };

// Toutes les sections du véhicule sauf la section déplacée et ses descendantes (cela ferait un cycle)
const listTargets = (sections: Section[], movedId: number, depth = 0): Option[] =>
    sections
        .filter((s) => s.id !== movedId)
        .flatMap((s) => [{ id: s.id, name: s.name, depth }, ...listTargets(s.subSections ?? [], movedId, depth + 1)]);

const parentOf = (sections: Section[], id: number, parent: number | null = null): number | null | undefined => {
    for (const s of sections) {
        if (s.id === id) return parent;
        const found = parentOf(s.subSections ?? [], id, s.id);
        if (found !== undefined) return found;
    }
};

const ROOT = "root";

const MoveSectionModal = ({ target, onClose, onMove }: MoveSectionModalProps) => {
    const ref = useRef<HTMLDialogElement>(null);
    const [choice, setChoice] = useState("");

    useEffect(() => {
        setChoice("");
        if (target) ref.current?.showModal();
        else ref.current?.close();
    }, [target]);

    const currentParent = target ? parentOf(target.vehiculeSections, target.section.id) : undefined;
    const options = target ? listTargets(target.vehiculeSections, target.section.id).filter((o) => o.id !== currentParent) : [];

    return (
        <dialog ref={ref} className="modal" onClose={onClose}>
            <div className="modal-box">
                <h3 className="font-bold text-lg">Déplacer la section</h3>
                <p className="py-2">
                    Où déplacer <strong>{target?.section.name}</strong> ?
                </p>
                <select className="select select-bordered w-full" value={choice} onChange={(e) => setChoice(e.target.value)}>
                    <option value="" disabled>
                        Choisir une destination…
                    </option>
                    {currentParent !== null && <option value={ROOT}>Racine du véhicule</option>}
                    {options.map((o) => (
                        <option key={o.id} value={o.id}>
                            {"  ".repeat(o.depth)}
                            {o.depth > 0 ? "↳ " : ""}
                            {o.name}
                        </option>
                    ))}
                </select>
                <form method="dialog" className="modal-action">
                    <button className="btn">Annuler</button>
                    <button
                        className="btn btn-primary"
                        disabled={!choice}
                        onClick={() => target && onMove(target.section.id, choice === ROOT ? null : Number(choice))}
                    >
                        Déplacer
                    </button>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>Fermer</button>
            </form>
        </dialog>
    );
};

export default MoveSectionModal;
