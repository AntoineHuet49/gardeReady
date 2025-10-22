import { Sections, Elements } from "~~/Models";

export class SectionsRepository {
    // Récupérer toutes les sections racines d'un véhicule avec leur hiérarchie complète
    public static async getSectionsByVehiculeId(vehiculeId: number) {
        return await Sections.findAll({
            where: { 
                vehicule_id: vehiculeId,
                parent_section_id: null // Seulement les sections racines
            },
            include: [
                {
                    model: Sections,
                    as: 'subSections',
                    include: [
                        {
                            model: Sections,
                            as: 'subSections',
                            include: [
                                {
                                    model: Elements,
                                    as: 'elements'
                                }
                            ]
                        },
                        {
                            model: Elements,
                            as: 'elements'
                        }
                    ]
                },
                {
                    model: Elements,
                    as: 'elements'
                }
            ]
        });
    }

    // Récupérer une section avec toute sa hiérarchie (enfants et éléments)
    public static async getSectionWithHierarchy(sectionId: number) {
        return await Sections.findByPk(sectionId, {
            include: [
                {
                    model: Sections,
                    as: 'subSections',
                    include: [
                        {
                            model: Elements,
                            as: 'elements'
                        },
                        {
                            model: Sections,
                            as: 'subSections'
                        }
                    ]
                },
                {
                    model: Elements,
                    as: 'elements'
                }
            ]
        });
    }

    // Récupérer le chemin complet d'une section (de la racine jusqu'à cette section)
    public static async getSectionPath(sectionId: number): Promise<Sections[]> {
        const path: Sections[] = [];
        let currentSection = await Sections.findByPk(sectionId, {
            include: [{
                model: Sections,
                as: 'parentSection'
            }]
        });

        while (currentSection) {
            path.unshift(currentSection);
            if (currentSection.parent_section_id) {
                currentSection = await Sections.findByPk(currentSection.parent_section_id, {
                    include: [{
                        model: Sections,
                        as: 'parentSection'
                    }]
                });
            } else {
                break;
            }
        }

        return path;
    }

    // Créer une nouvelle section
    public static async createSection(data: {
        name: string;
        vehicule_id?: number;
        parent_section_id?: number;
    }) {
        return await Sections.create(data);
    }

    // Mettre à jour une section
    public static async updateSection(sectionId: number, data: Partial<{
        name: string;
        vehicule_id: number;
        parent_section_id: number;
    }>) {
        return await Sections.update(data, {
            where: { id: sectionId }
        });
    }

    // Supprimer une section (cascade automatique pour les sous-sections et éléments)
    public static async deleteSection(sectionId: number) {
        return await Sections.destroy({
            where: { id: sectionId }
        });
    }
}