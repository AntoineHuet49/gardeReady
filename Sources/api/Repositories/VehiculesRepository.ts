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

    public static async createVehicule(data: { name: string }) {
        const vehicule = await Vehicules.create(data);
        return vehicule?.toJSON();
    }

    public static async deleteVehicule(id: number) {
        const vehicule = await Vehicules.findByPk(id);
        if (!vehicule) {
            return null;
        }
        await vehicule.destroy();
        return true;
    }

    // Méthode de compatibilité (à supprimer plus tard)
    public static async getOneByIdWithElements(id: number) {
        return this.getOneByIdWithSections(id);
    }
}
