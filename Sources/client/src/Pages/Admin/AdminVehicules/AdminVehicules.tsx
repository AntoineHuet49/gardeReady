import { useState } from "react";
import { Vehicule } from "../../../Types/Vehicule";
import { Section } from "../../../Types/Section";
import { Element } from "../../../Types/Element";
import Loader from "../../../Components/Loader/Loader";
import Alert from "../../../Components/Alert/Alert";
import Collapse from "../../../Components/Collapse/Collapse";
import AddElementModal from "../../../Components/Modal/AddElementModal";
import { useElementMutations } from "../../../hooks/useElementMutations";

type AdminVehiculesProps = {
    vehicules: Vehicule[];
    isLoading: boolean;
    error: Error | null;
};

const AdminVehicules = ({ vehicules, isLoading, error }: AdminVehiculesProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<{ id: number; name: string } | null>(null);
    const { deleteElementMutation } = useElementMutations();

    const openModal = (sectionId: number, sectionName: string) => {
        setSelectedSection({ id: sectionId, name: sectionName });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedSection(null);
    };

    const handleDeleteElement = (elementId: number, elementName: string) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'équipement "${elementName}" ?`)) {
            deleteElementMutation.mutate(elementId);
        }
    };

    const renderSection = (section: Section, level: number = 0): JSX.Element => {
        const hasElements = section.elements && section.elements.length > 0;
        const hasSubSections = section.subSections && section.subSections.length > 0;

        return (
            <div key={section.id} className="mb-2">
                <Collapse title={section.name} level={level + 1}>
                    <div className="space-y-2">
                        {/* Header avec bouton d'ajout */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-600">
                                {hasElements ? `${section.elements!.length} équipement(s)` : "Aucun équipement"}
                            </span>
                            <button
                                onClick={() => openModal(section.id, section.name)}
                                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                title="Ajouter un équipement"
                            >
                                <span className="text-sm font-bold">+</span>
                                <span>Équipement</span>
                            </button>
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
                                            <span className="font-medium">{element.name}</span>
                                            <button
                                                onClick={() => handleDeleteElement(element.id, element.name)}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200 ml-2 p-1 rounded hover:bg-red-100"
                                                title="Supprimer cet équipement"
                                                disabled={deleteElementMutation.isPending}
                                            >
                                                {deleteElementMutation.isPending ? "..." : "🗑️"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sous-sections */}
                        {hasSubSections && (
                            <div className="space-y-2 mt-4">
                                {section.subSections!.map((subSection: Section) => 
                                    renderSection(subSection, level + 1)
                                )}
                            </div>
                        )}
                    </div>
                </Collapse>
            </div>
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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Véhicules</h1>
                <p className="text-gray-600">
                    Vue d'ensemble des véhicules et de leurs équipements organisés par sections
                </p>
            </div>

            {vehicules.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Aucun véhicule trouvé</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {vehicules.map((vehicule: Vehicule) => (
                        <div key={vehicule.id}>
                            <Collapse title={`${vehicule.name}`} level={0}>
                                <div className="p-4">
                                    {vehicule.sections && vehicule.sections.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="text-sm text-gray-600 mb-4">
                                                <strong>Sections :</strong> {vehicule.sections.length} section(s) principale(s)
                                            </div>
                                            {vehicule.sections.map((section: Section) => 
                                                renderSection(section, 0)
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>Ce véhicule n'a aucune section configurée</p>
                                            <p className="text-sm mt-2">Ajoutez des sections pour organiser les équipements</p>
                                        </div>
                                    )}
                                </div>
                            </Collapse>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Modal d'ajout d'équipement */}
            {selectedSection && (
                <AddElementModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    sectionId={selectedSection.id}
                    sectionName={selectedSection.name}
                />
            )}
        </div>
    );
};

export default AdminVehicules;
