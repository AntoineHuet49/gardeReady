import { ReactNode } from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";

// Données portées par un glissement de section
export type SectionDragData = { sectionId: number; vehiculeId: number; isRoot: boolean };

// Poignée de glissement (touch-none : le doigt glisse la section au lieu de faire défiler la page)
export const SectionDragHandle = ({ sectionId, vehiculeId, isRoot }: SectionDragData) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `section-${sectionId}`,
        data: { sectionId, vehiculeId, isRoot } satisfies SectionDragData,
    });

    return (
        <button
            type="button"
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="btn btn-xs touch-none cursor-grab active:cursor-grabbing"
            title="Glisser pour déplacer cette section"
            aria-label="Déplacer cette section"
        >
            ⠿
        </button>
    );
};

// Zone de dépôt : n'accepte que les sections du même véhicule, et jamais la section elle-même
const useSectionDrop = (id: string, vehiculeId: number, sectionId?: number) => {
    const { active } = useDndContext();
    const drag = active?.data.current as SectionDragData | undefined;
    const disabled = !drag || drag.vehiculeId !== vehiculeId || drag.sectionId === sectionId;
    const { setNodeRef, isOver } = useDroppable({ id, data: { sectionId }, disabled });
    return { setNodeRef, isOver: isOver && !disabled };
};

export const SectionDropTarget = ({ sectionId, vehiculeId, children }: { sectionId: number; vehiculeId: number; children: ReactNode }) => {
    const { setNodeRef, isOver } = useSectionDrop(`drop-section-${sectionId}`, vehiculeId, sectionId);
    return (
        <div ref={setNodeRef} className={isOver ? "rounded outline-2 outline-dashed outline-primary" : undefined}>
            {children}
        </div>
    );
};

// Dépôt à la racine du véhicule (sectionId absent) : visible uniquement pendant le glissement d'une sous-section
export const VehiculeRootDropZone = ({ vehiculeId }: { vehiculeId: number }) => {
    const { active } = useDndContext();
    const drag = active?.data.current as SectionDragData | undefined;
    const { setNodeRef, isOver } = useSectionDrop(`drop-root-${vehiculeId}`, vehiculeId);
    if (!drag || drag.vehiculeId !== vehiculeId || drag.isRoot) return null;
    return (
        <div
            ref={setNodeRef}
            className={`mb-3 rounded border-2 border-dashed p-3 text-center text-sm ${isOver ? "border-primary bg-primary/10" : "border-base-300"}`}
        >
            Déposer ici pour remonter à la racine du véhicule
        </div>
    );
};
