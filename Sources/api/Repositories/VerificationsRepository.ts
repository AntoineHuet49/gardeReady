import { Gardes, Users, VehiculeVerifications, Vehicules } from "~~/Models";
import { VerificationResult } from "~~/Models/VehiculeVerifications";

export class VerificationsRepository {
    public static async Create(data: { vehicule_id: number; user_id: number; garde_id: number | null; results: VerificationResult[] }) {
        return VehiculeVerifications.create(data);
    }

    public static async GardeIdsOfResponsable(userId: number) {
        return (await Gardes.findAll({ where: { responsable: userId }, attributes: ["id"] })).map((g) => g.id);
    }

    public static async SetMailSent(id: number, sent: boolean) {
        await VehiculeVerifications.update({ mail_envoye: sent }, { where: { id } });
    }

    private static include = [
        { model: Vehicules, as: "vehicule", attributes: ["id", "name"] },
        { model: Users, as: "user", attributes: ["id", "firstname", "lastname"] },
        { model: Gardes, as: "garde", attributes: ["id", "numero"] },
    ];

    public static async GetOne(id: number) {
        const row = await VehiculeVerifications.findByPk(id, { include: this.include });
        return row ? (row.get({ plain: true }) as typeof row & { user: { firstname: string; lastname: string }; vehicule: { name: string } }) : null;
    }

    /** Plus récentes d'abord ; `gardeIds` omis = toutes les gardes ; `userId` = celles d'un agent. */
    public static async GetAll(gardeIds?: number[], userId?: number) {
        const rows = await VehiculeVerifications.findAll({
            where: { ...(gardeIds && { garde_id: gardeIds }), ...(userId && { user_id: userId }) },
            include: this.include,
            order: [["created_at", "DESC"], ["id", "DESC"]],
            limit: 500, // ponytail: pas de pagination, à ajouter si l'historique dépasse ce plafond
        });
        return rows.map((row) => row.get({ plain: true }));
    }
}
