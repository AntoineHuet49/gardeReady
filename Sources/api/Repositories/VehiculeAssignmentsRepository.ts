import { Op } from "sequelize";
import { Users, VehiculeAssignments, Vehicules } from "~~/Models";
import { dbContext } from "~~/Utils/Database";

export class VehiculeAssignmentsRepository {
    public static async GetBetween(from: string, to: string) {
        const rows = await VehiculeAssignments.findAll({
            where: { shift_date: { [Op.between]: [from, to] } },
            include: [
                { model: Vehicules, as: "vehicule", attributes: ["id", "name"] },
                { model: Users, as: "user", attributes: ["id", "firstname", "lastname"] },
            ],
            order: [["shift_date", "ASC"], ["vehicule_id", "ASC"]],
        });
        return rows.map((row) => row.get({ plain: true }));
    }

    /** Remplace toutes les assignations d'une semaine, en une transaction. */
    public static async ReplaceWeek(shiftDate: string, rows: { vehicule_id: number; user_id: number }[]) {
        await dbContext.transaction(async (transaction) => {
            await VehiculeAssignments.destroy({ where: { shift_date: shiftDate }, transaction });
            await VehiculeAssignments.bulkCreate(
                rows.map((row) => ({ ...row, shift_date: shiftDate })),
                { transaction }
            );
        });
    }

    public static async CountVehicules(ids: number[]) {
        return Vehicules.count({ where: { id: ids } });
    }
}
