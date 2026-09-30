import { Op } from "sequelize";
import { GardeRotation, Gardes, Users } from "~~/Models";
import { TUser } from "~~/Types/User";
import { CreateGardeDto } from "~~/Types/DTO/CreateGardeDto";

export class GardesRepository {
    public static async GetAll(includeSuperAdmins: boolean) {
        const gardes = await Gardes.findAll({
            include: [{
                model: Users,
                as: 'responsableUser',
                attributes: ['id', 'firstname', 'lastname', 'email']
            }, {
                // Membres (sans email) pour le planning, lisible par tous les connectés
                model: Users,
                as: 'users',
                attributes: ['id', 'firstname', 'lastname', 'role'],
                where: includeSuperAdmins ? undefined : { role: { [Op.ne]: 'superAdmin' } },
                required: false,
            }],
            order: [['numero', 'ASC'], [{ model: Users, as: 'users' }, 'lastname', 'ASC']]
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
        const responsable  = await Users.findByPk(garde?.dataValues.responsable ?? undefined);
        return responsable?.dataValues as TUser;
    }

    public static async UpdateResponsable(id: number, responsableId: number | null) {
        const garde = await Gardes.findByPk(id);
        if (!garde) {
            return null;
        }
        garde.responsable = responsableId;
        await garde.save();
        // Recharger avec les associations
        return await Gardes.findByPk(id, {
            include: [{
                model: Users,
                as: 'responsableUser',
                attributes: ['id', 'firstname', 'lastname', 'email']
            }]
        });
    }

    public static async GetRotation() {
        const rotation = await GardeRotation.findByPk(1);
        return rotation?.dataValues ?? null;
    }

    public static async UpsertRotation(referenceDate: string) {
        const [rotation] = await GardeRotation.upsert({ id: 1, reference_date: referenceDate });
        return rotation.dataValues;
    }
}