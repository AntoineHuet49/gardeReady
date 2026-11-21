import { Gardes, Users, VehiculeVerifications, Vehicules } from "~~/Models";
import { VerificationResult } from "~~/Models/VehiculeVerifications";

export class VerificationsRepository {
    public static async Create(data: { vehicule_id: number; user_id: number; garde_id: number | null; results: VerificationResult[] }) {
        return VehiculeVerifications.create(data);
    }

    public static async GardeIdsOfResponsable(userId: number) {
        return (await Gardes.findAll({ where: { responsable: userId }, attributes: ["id"] })).map((g) => g.id);
    }

    /** Plus récentes d'abord ; `gardeIds` omis = toutes les gardes. */
    public static async GetAll(gardeIds?: number[]) {
        const rows = await VehiculeVerifications.findAll({
            where: gardeIds ? { garde_id: gardeIds } : undefined,
            include: [
                { model: Vehicules, as: "vehicule", attributes: ["id", "name"] },
                { model: Users, as: "user", attributes: ["id", "firstname", "lastname"] },
                { model: Gardes, as: "garde", attributes: ["id", "numero"] },
            ],
            order: [["created_at", "DESC"], ["id", "DESC"]],
            limit: 500, // ponytail: pas de pagination, à ajouter si l'historique dépasse ce plafond
        });
        return rows.map((row) => row.get({ plain: true }));
    }
}
