import { Elements, Vehicules, Sections } from "~~/Models";

export default class VehiculesRepository {
    public static async getAllVehicules() {
        const vehicules = await Vehicules.findAll();
        return vehicules;
    }

    public static async getOneById(id: number) {
        const vehicule = await Vehicules.findByPk(id);
        return vehicule?.dataValues;
    }

    public static async getOneByIdWithSections(id: number) {
        const vehicule = await Vehicules.findByPk(id, {
            include: [{
                model: Sections,
                as: 'sections',
                where: { parent_section_id: null }, // Seulement les sections racines
                required: false,
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
                                as: 'subSections',
                                include: [{
                                    model: Elements,
                                    as: 'elements'
                                }]
                            }
                        ]
                    },
                    {
                        model: Elements,
                        as: 'elements'
                    }
                ]
            }]
        });
        return vehicule;
    }

    // Méthode de compatibilité (à supprimer plus tard)
    public static async getOneByIdWithElements(id: number) {
        return this.getOneByIdWithSections(id);
    }
}
