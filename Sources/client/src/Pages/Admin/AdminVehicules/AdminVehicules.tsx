import { Vehicule } from "../../../Types/Vehicule";
import { Section } from "../../../Types/Section";
import { Element } from "../../../Types/Element";
import Loader from "../../../Components/Loader/Loader";
import Alert from "../../../Components/Alert/Alert";
import Collapse from "../../../Components/Collapse/Collapse";

type AdminVehiculesProps = {
    vehicules: Vehicule[];
    isLoading: boolean;
    error: Error | null;
};

const AdminVehicules = ({ vehicules, isLoading, error }: AdminVehiculesProps) => {
    const renderSection = (section: Section, level: number = 0): JSX.Element => {
        const hasElements = section.elements && section.elements.length > 0;
        const hasSubSections = section.subSections && section.subSections.length > 0;

        return (
            <div key={section.id} className="mb-2">
                <Collapse title={section.name} level={level + 1}>
                    <div className="space-y-2">
                        {/* Éléments de cette section */}
                        {hasElements && (
                            <div className="space-y-1">
                                <h4 className="font-medium text-gray-700 text-sm">Équipements :</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {section.elements!.map((element: Element) => (
                                        <div 
                                            key={element.id}
                                            className="bg-gray-50 p-2 rounded border text-sm"
                                        >
                                            <span className="font-medium">{element.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sous-sections */}
                        {hasSubSections && (
                            <div className="space-y-2">
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
        </div>
    );
};

export default AdminVehicules;
