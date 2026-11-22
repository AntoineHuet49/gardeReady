import { Users, VehiculeKilometrages, Vehicules } from "~~/Models";

export class VehiculeKilometragesRepository {
    public static async GetByVehicule(vehiculeId: number) {
        const rows = await VehiculeKilometrages.findAll({
            where: { vehicule_id: vehiculeId },
            include: [{ model: Users, as: "user", attributes: ["id", "firstname", "lastname"] }],
            order: [["created_at", "DESC"], ["id", "DESC"]],
        });
        return rows.map((row) => row.get({ plain: true }));
    }

    public static async VehiculeExists(id: number) {
        return (await Vehicules.count({ where: { id } })) > 0;
    }

    public static async Create(data: { vehicule_id: number; user_id: number; kilometrage: number; motif: string | null }) {
        return (await VehiculeKilometrages.create(data)).get({ plain: true });
    }
}
