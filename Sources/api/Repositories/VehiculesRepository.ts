import { Elements, Vehicules } from "~~/Models";

export default class VehiculesRepository {
    public static async getAllVehicules() {
        const vehicules = await Vehicules.findAll();
        return vehicules;
    }

    public static async getOneById(id: number) {
        const vehicule = await Vehicules.findByPk(id);
        return vehicule?.dataValues;
    }

    public static async getOneByIdWithElements(id: number) {
        const vehicule = await Vehicules.findByPk(id, {
            include: [{
                association: 'elements',
            }],
        });
        return vehicule;
    }
}
