import { useState } from "react";
import { CollisionDetection, DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core";
import { Vehicule } from "../../../Types/Vehicule";
import { Section } from "../../../Types/Section";
import { Element } from "../../../Types/Element";
import Loader from "../../../Components/Loader/Loader";
import Alert from "../../../Components/Alert/Alert";
import Collapse from "../../../Components/Collapse/Collapse";
import AddElementModal from "../../../Components/Modal/AddElementModal";
import AddSectionModal from "../../../Components/Modal/AddSectionModal";
import AddVehiculeModal from "../../../Components/Modal/AddVehiculeModal";
import Button from "../../../Components/Button/button";
import SectionPhotoButton from "../../../Components/Section/SectionPhotoButton";
import { SectionDragData, SectionDragHandle, SectionDropTarget, VehiculeRootDropZone } from "../../../Components/Section/SectionDnd";
import ConfirmModal, { PendingConfirm } from "../../../Components/Modal/ConfirmModal";
import MoveSectionModal, { MoveSectionTarget } from "../../../Components/Modal/MoveSectionModal";
import { useElementMutations } from "../../../hooks/useElementMutations";
import { useSectionMutations } from "../../../hooks/useSectionMutations";
import { useVehiculeMutations } from "../../../hooks/useVehiculeMutations";

const findSection = (sections: Section[] | undefined, id: number): Section | undefined => {
    for (const section of sections ?? []) {
        const found = section.id === id ? section : findSection(section.subSections, id);
        if (found) return found;
    }
};

// Un Collapse replié garde ses enfants dans le DOM (donc mesurés par dnd-kit) alors qu'ils ne sont pas affichés
const isShown = (node: HTMLElement | null | undefined): boolean => {
    let el = node ?? null;
    while (el) {
        const content = el.closest(".collapse-content");
        if (!content) return true;
        const collapse = content.parentElement;
        if (!collapse?.querySelector(":scope > input")?.matches(":checked")) return false;
        el = collapse;
    }
    return true;
};

// Zones de dépôt imbriquées : parmi celles affichées sous le pointeur, on garde la plus petite, c'est-à-dire la plus profonde
const innermostDrop: CollisionDetection = (args) => {
    const area = (id: string | number) => {
        const rect = args.droppableRects.get(id);
        return rect ? rect.width * rect.height : Infinity;
    };
    const shown = (id: string | number) => isShown(args.droppableContainers.find((c) => c.id === id)?.node.current);
    return pointerWithin(args)
        .filter((c) => shown(c.id))
        .sort((a, b) => area(a.id) - area(b.id))
        .slice(0, 1);
};

type AdminVehiculesProps = {
    vehicules: Vehicule[];
    isLoading: boolean;
    error: Error | null;
};

const AdminVehicules = ({ vehicules, isLoading, error }: AdminVehiculesProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<{ id: number; name: string; element?: Element } | null>(null);
    const [sectionModalOpen, setSectionModalOpen] = useState(false);
    const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm>(null);
    const [vehiculeModalOpen, setVehiculeModalOpen] = useState(false);
    const [selectedContext, setSelectedContext] = useState<{ 
        vehiculeId?: number; 
        parentSectionId?: number; 
        contextName: string;
        section?: { id: number; name: string };
    } | null>(null);
    
    const { deleteElementMutation } = useElementMutations();
    const { deleteSectionMutation, moveSectionMutation, uploadSectionPhotoMutation, deleteSectionPhotoMutation } = useSectionMutations();
    const { deleteVehiculeMutation } = useVehiculeMutations();

    // distance : un simple clic sur la poignée ne déclenche pas de glissement
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const [moveTarget, setMoveTarget] = useState<MoveSectionTarget>(null);

    // Nom de la section en cours de glissement, affiché dans l'aperçu qui suit le pointeur
    const [draggedName, setDraggedName] = useState<string | null>(null);

    const handleDragStart = ({ active }: DragStartEvent) => {
        const drag = active.data.current as SectionDragData | undefined;
        if (drag) setDraggedName(findSection(vehicules.find((v) => v.id === drag.vehiculeId)?.sections, drag.sectionId)?.name ?? null);
    };

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        setDraggedName(null);
        const drag = active.data.current as SectionDragData | undefined;
        if (!drag || !over) return;
        // Dépôt invalide : autre véhicule, ou sur la section elle-même
        if (over.data.current?.vehiculeId !== drag.vehiculeId || over.data.current?.sectionId === drag.sectionId) return;
        const targetId: number | undefined = over.data.current?.sectionId; // undefined = racine du véhicule
        const vehicule = vehicules.find((v) => v.id === drag.vehiculeId);
        const moved = findSection(vehicule?.sections, drag.sectionId);
        const target = targetId === undefined ? undefined : findSection(vehicule?.sections, targetId);
        if (!moved) return;
        setPendingConfirm({
            message: target
                ? `Déplacer la section "${moved.name}" dans "${target.name}" ?`
                : `Remonter la section "${moved.name}" à la racine du véhicule ?`,
            title: "Confirmer le déplacement",
            confirmLabel: "Déplacer",
            onConfirm: () => moveSectionMutation.mutate({ id: moved.id, parentSectionId: targetId ?? null }),
        });
    };

    const openModal = (sectionId: number, sectionName: string, element?: Element) => {
        setSelectedSection({ id: sectionId, name: sectionName, element });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedSection(null);
    };

    const openSectionModal = (vehiculeId?: number, parentSectionId?: number, contextName?: string) => {
        setSelectedContext({ vehiculeId, parentSectionId, contextName: contextName || "" });
        setSectionModalOpen(true);
    };

    const openEditSectionModal = (section: Section) => {
        setSelectedContext({ contextName: section.name, section: { id: section.id, name: section.name } });
        setSectionModalOpen(true);
    };

    const closeSectionModal = () => {
        setSectionModalOpen(false);
        setSelectedContext(null);
    };

    const openVehiculeModal = () => {
        setVehiculeModalOpen(true);
    };

    const closeVehiculeModal = () => {
        setVehiculeModalOpen(false);
    };

    const handleDeleteElement = (elementId: number, elementName: string) => {
        setPendingConfirm({
            message: `Êtes-vous sûr de vouloir supprimer l'équipement "${elementName}" ?`,
            onConfirm: () => deleteElementMutation.mutate(elementId),
        });
    };

    const handleDeleteSection = (sectionId: number, sectionName: string) => {
        setPendingConfirm({
            message: `Êtes-vous sûr de vouloir supprimer la section "${sectionName}" et tout son contenu ?`,
            onConfirm: () => deleteSectionMutation.mutate(sectionId),
        });
    };

    const handleDeleteSectionPhoto = (sectionId: number, sectionName: string) => {
        setPendingConfirm({
            message: `Êtes-vous sûr de vouloir supprimer la photo de la section "${sectionName}" ?`,
            onConfirm: () => deleteSectionPhotoMutation.mutate(sectionId),
        });
    };

    const handleDeleteVehicule =(vehiculeId: number, vehiculeName: string) => {
        setPendingConfirm({
            message: `Êtes-vous sûr de vouloir supprimer le véhicule "${vehiculeName}" et tout son contenu ?`,
            onConfirm: () => deleteVehiculeMutation.mutate(vehiculeId),
        });
    };

    const renderSection = (section: Section, vehiculeId: number, level: number = 0): JSX.Element => {
        const hasElements = section.elements && section.elements.length > 0;
        const hasSubSections = section.subSections && section.subSections.length > 0;

        return (
            <SectionDropTarget key={section.id} sectionId={section.id} vehiculeId={vehiculeId}>
              <div className="mb-2">
                <Collapse title={section.name} level={level + 1}>
                    <div className="space-y-2">
                        {/* Header avec boutons d'actions */}
                        <div className="flex justify-between items-start mb-3 gap-2">
                            <div className="text-sm text-gray-600">
                                <div>{hasElements ? `${section.elements!.length} équipement(s)` : "Aucun équipement"}</div>
                                <div>{hasSubSections ? `${section.subSections!.length} sous-section(s)` : "Aucune sous-section"}</div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <SectionDragHandle sectionId={section.id} vehiculeId={vehiculeId} isRoot={level === 0} />
                                <Button
                                    text="↪ Déplacer"
                                    onClick={() => setMoveTarget({ section, vehiculeSections: vehicules.find((v) => v.id === vehiculeId)?.sections ?? [] })}
                                    className="btn-xs"
                                    title="Déplacer cette section vers une autre section"
                                />
                                <Button
                                    text="+ Équipement"
                                    onClick={() => openModal(section.id, section.name)}
                                    className="btn-xs bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                    title="Ajouter un équipement"
                                />
                                <Button
                                    text="+ Section"
                                    onClick={() => openSectionModal(undefined, section.id, section.name)}
                                    className="btn-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                    title="Ajouter une sous-section"
                                />
                                {section.has_photo && <SectionPhotoButton section={section} />}
                                <label
                                    className={`btn btn-xs bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 ${uploadSectionPhotoMutation.isPending ? "btn-disabled" : ""}`}
                                    title={section.has_photo ? "Remplacer la photo de la section" : "Ajouter une photo de la section"}
                                >
                                    {section.has_photo ? "Changer la photo" : "+ Photo"}
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) uploadSectionPhotoMutation.mutate({ id: section.id, file });
                                            e.target.value = "";
                                        }}
                                    />
                                </label>
                                {section.has_photo && (
                                    <Button
                                        text="✕ Photo"
                                        onClick={() => handleDeleteSectionPhoto(section.id, section.name)}
                                        className="btn-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                        title="Supprimer la photo de la section"
                                        disabled={deleteSectionPhotoMutation.isPending}
                                    />
                                )}
                                <Button
                                    text="✎"
                                    onClick={() => openEditSectionModal(section)}
                                    className="btn-xs bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200"
                                    title="Renommer cette section"
                                />
                                <Button
                                    text={deleteSectionMutation.isPending ? "..." : "✕"}
                                    onClick={() => handleDeleteSection(section.id, section.name)}
                                    className="btn-xs bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                    title="Supprimer cette section"
                                    disabled={deleteSectionMutation.isPending}
                                />
                            </div>
                        </div>

                        {/* Éléments de cette section */}
                        {hasElements && (
                            <div className="space-y-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {section.elements!.map((element: Element) => (
                                        <div 
                                            key={element.id}
                                            className="bg-gray-50 p-2 rounded border text-sm flex justify-between items-center group"
                                        >
                                            <span className="font-medium">
                                                <strong>{element.quantite} </strong>
                                                {element.name}
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    text="✎"
                                                    onClick={() => openModal(section.id, section.name, element)}
                                                    className="btn-xs opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200"
                                                    title="Modifier cet équipement"
                                                />
                                                <Button
                                                    text={deleteElementMutation.isPending ? "..." : "✕"}
                                                    onClick={() => handleDeleteElement(element.id, element.name)}
                                                    className="btn-xs opacity-0 group-hover:opacity-100 focus-visible:opacity-100 bg-red-100 text-red-500 border-red-200 hover:bg-red-200 hover:text-red-700 transition-all duration-200"
                                                    title="Supprimer cet équipement"
                                                    disabled={deleteElementMutation.isPending}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sous-sections */}
                        {hasSubSections && (
                            <div className="space-y-2 mt-4">
                                {section.subSections!.map((subSection: Section) => 
                                    renderSection(subSection, vehiculeId, level + 1)
                                )}
                            </div>
                        )}
                    </div>
                </Collapse>
              </div>
            </SectionDropTarget>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <Alert 
                type="error" 
                display={true} 
                message="Erreur lors du chargement des véhicules" 
            />
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6 flex justify-end">
                <Button
                    text="+ Ajouter un véhicule"
                    onClick={openVehiculeModal}
                    className="btn btn-primary"
                />
            </div>

            {vehicules.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Aucun véhicule trouvé</p>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={innermostDrop}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => setDraggedName(null)}
                >
                <div className="space-y-4">
                    {vehicules.map((vehicule: Vehicule) => (
                        <div key={vehicule.id}>
                            <Collapse title={`${vehicule.name}`} level={0}>
                                <div className="p-4">
                                    {vehicule.sections && vehicule.sections.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-sm text-gray-600">
                                                    <strong>Sections :</strong> {vehicule.sections.length} section(s) principale(s)
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        text="+ Section"
                                                        onClick={() => openSectionModal(vehicule.id, undefined, vehicule.name)}
                                                        className="btn-sm bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                                        title="Ajouter une section au véhicule"
                                                    />
                                                    <Button
                                                        text={deleteVehiculeMutation.isPending ? "..." : "✕"}
                                                        onClick={() => handleDeleteVehicule(vehicule.id, vehicule.name)}
                                                        className="btn-sm bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                                                        title="Supprimer ce véhicule"
                                                        disabled={deleteVehiculeMutation.isPending}
                                                    />
                                                </div>
                                            </div>
                                            <VehiculeRootDropZone vehiculeId={vehicule.id} />
                                            {vehicule.sections.map((section: Section) =>
                                                renderSection(section, vehicule.id, 0)
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Ce véhicule n'a aucune section configurée</p>
                                            <p className="text-sm mt-2 mb-4">Ajoutez des sections pour organiser les équipements</p>
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    text="+ Ajouter une section"
                                                    onClick={() => openSectionModal(vehicule.id, undefined, vehicule.name)}
                                                    className="btn-primary"
                                                />
                                                <Button
                                                    text={deleteVehiculeMutation.isPending ? "..." : "Supprimer"}
                                                    onClick={() => handleDeleteVehicule(vehicule.id, vehicule.name)}
                                                    className="btn btn-error"
                                                    title="Supprimer ce véhicule"
                                                    disabled={deleteVehiculeMutation.isPending}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Collapse>
                        </div>
                    ))}
                </div>
                <DragOverlay>
                    {draggedName && <div className="badge badge-primary badge-lg shadow-lg cursor-grabbing">⠿ {draggedName}</div>}
                </DragOverlay>
                </DndContext>
            )}

            {/* Modal d'ajout d'équipement */}
            {selectedSection && (
                <AddElementModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    sectionId={selectedSection.id}
                    sectionName={selectedSection.name}
                    element={selectedSection.element}
                />
            )}

            {/* Modal d'ajout de section */}
            {selectedContext && (
                <AddSectionModal
                    isOpen={sectionModalOpen}
                    onClose={closeSectionModal}
                    vehiculeId={selectedContext.vehiculeId}
                    parentSectionId={selectedContext.parentSectionId}
                    contextName={selectedContext.contextName}
                    section={selectedContext.section}
                />
            )}

            <ConfirmModal pending={pendingConfirm} onClose={() => setPendingConfirm(null)} />

            <MoveSectionModal
                target={moveTarget}
                onClose={() => setMoveTarget(null)}
                onMove={(id, parentSectionId) => moveSectionMutation.mutate({ id, parentSectionId })}
            />

            {/* Modal d'ajout de véhicule */}
            <AddVehiculeModal
                isOpen={vehiculeModalOpen}
                onClose={closeVehiculeModal}
            />
        </div>
    );
};

export default AdminVehicules;
