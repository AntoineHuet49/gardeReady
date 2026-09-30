import { Request, Response } from "express";
import { HttpCode } from "~~/Helpers/HttpCode";
import { VehiculeAssignmentsService, WeekAssignmentsDto } from "~~/Services/VehiculeAssignmentsService";
import { isFriday } from "~~/Utils/GardeRotation";

const MAX_RANGE_DAYS = 366;
const isPositiveInt = (v: unknown): v is number => Number.isInteger(v) && (v as number) > 0;

export class VehiculeAssignmentsController {
    public static getAssignments = async (req: Request, res: Response) => {
        try {
            const { from, to } = req.query;
            if (!isFriday(from) || !isFriday(to) || from > to) {
                res.status(HttpCode.BadRequest).json({ message: "Paramètres from/to invalides (vendredis AAAA-MM-JJ)" });
                return;
            }
            if ((Date.parse(to) - Date.parse(from)) / 86_400_000 > MAX_RANGE_DAYS) {
                res.status(HttpCode.BadRequest).json({ message: "Plage de dates trop grande (1 an maximum)" });
                return;
            }
            const result = await VehiculeAssignmentsService.getBetween(from, to);
            res.status(HttpCode.Ok).json(result.data);
        } catch (error: any) {
            console.error("Erreur lors de la récupération des assignations:", error);
            res.status(HttpCode.InternalServerError).json({ message: "Erreur lors de la récupération des assignations" });
        }
    };

    public static replaceWeek = async (req: Request, res: Response) => {
        try {
            const { shiftDate } = req.params;
            const assignments: unknown = req.body?.assignments;
            if (!isFriday(shiftDate)) {
                res.status(HttpCode.BadRequest).json({ message: "La semaine doit être identifiée par un vendredi (AAAA-MM-JJ)" });
                return;
            }
            const valid = Array.isArray(assignments) && assignments.every((a) =>
                isPositiveInt(a?.vehicule_id) && Array.isArray(a?.user_ids) && a.user_ids.every(isPositiveInt));
            if (!valid) {
                res.status(HttpCode.BadRequest).json({ message: "Format d'assignations invalide" });
                return;
            }

            const result = await VehiculeAssignmentsService.replaceWeek(shiftDate, assignments as WeekAssignmentsDto, req.user!);
            if (!result.success) {
                res.status(result.errors ?? HttpCode.BadRequest).json({ message: result.message });
                return;
            }
            res.status(HttpCode.Ok).json(result.data);
        } catch (error: any) {
            console.error("Erreur lors de l'enregistrement des assignations:", error);
            res.status(HttpCode.InternalServerError).json({ message: "Erreur lors de l'enregistrement des assignations" });
        }
    };
}
