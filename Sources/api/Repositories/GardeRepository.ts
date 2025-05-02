import { Gardes, Users } from "~~/Models";
import { TUser } from "~~/Types/User";

export class GardesRepository {
    public static async GetAll() {
        const gardes = await Gardes.findAll();
        return gardes
    }

    public static async getOneById(id: number) {
        const garde = await Gardes.findByPk(id);
        return garde?.dataValues;
    }

    public static async getResponsable(id: number) {
        const garde = await Gardes.findByPk(id);
        const responsable  = await Users.findByPk(garde?.dataValues.responsable);
        return responsable?.dataValues as TUser;
    }
}