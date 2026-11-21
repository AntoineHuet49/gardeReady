import { Request, Response } from "express";
import { HttpCode } from "~~/Helpers/HttpCode";
import { VehiculeKilometragesService } from "~~/Services/VehiculeKilometragesService";

const MAX_KM = 2_000_000; // garde-fou contre les fautes de frappe (et le INT Postgres)
const MAX_MOTIF = 200;

export class VehiculeKilometragesController {
    public static getHistory = async (req: Request, res: Response) => {
        try {
            const result = await VehiculeKilometragesService.getHistory(Number(req.params.id));
            if (!result.success) {
                res.status(result.errors ?? HttpCode.BadRequest).json({ message: result.message });
                return;
            }
            res.status(HttpCode.Ok).json(result.data);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique kilométrique:", error);
            res.status(HttpCode.InternalServerError).json({ message: "Erreur lors de la récupération de l'historique" });
        }
    };

    public static add = async (req: Request, res: Response) => {
        try {
            const { kilometrage, motif } = req.body ?? {};
            const id = Number(req.params.id);
            if (!Number.isInteger(id) || !Number.isInteger(kilometrage) || kilometrage < 0 || kilometrage > MAX_KM) {
                res.status(HttpCode.BadRequest).json({ message: "Kilométrage invalide (entier positif)" });
                return;
            }
            if (motif != null && (typeof motif !== "string" || motif.length > MAX_MOTIF)) {
                res.status(HttpCode.BadRequest).json({ message: `Motif invalide (${MAX_MOTIF} caractères maximum)` });
                return;
            }
            const result = await VehiculeKilometragesService.add(id, req.user!.id, kilometrage, motif ?? undefined);
            if (!result.success) {
                res.status(result.errors ?? HttpCode.BadRequest).json({ message: result.message });
                return;
            }
            res.status(HttpCode.Created).json(result.data);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement du kilométrage:", error);
            res.status(HttpCode.InternalServerError).json({ message: "Erreur lors de l'enregistrement du kilométrage" });
        }
    };
}
