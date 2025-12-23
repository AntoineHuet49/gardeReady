import { Gardes, Users } from "~~/Models";
import { TUser } from "~~/Types/User";
import { CreateGardeDto } from "~~/Types/DTO/CreateGardeDto";

export class GardesRepository {
    public static async GetAll() {
        const gardes = await Gardes.findAll({
            include: [{
                model: Users,
                as: 'responsableUser',
                attributes: ['id', 'firstname', 'lastname', 'email']
            }],
            order: [['numero', 'ASC']]
        });
        return gardes
    }

    public static async Create(data: CreateGardeDto) {
        const garde = await Gardes.create({
            numero: data.numero,
            color: data.color,
            responsable: data.responsable || undefined
        });
        return garde;
    }

    public static async Delete(id: number) {
        const garde = await Gardes.findByPk(id);
        if (!garde) {
            return null;
        }
        await garde.destroy();
        return true;
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