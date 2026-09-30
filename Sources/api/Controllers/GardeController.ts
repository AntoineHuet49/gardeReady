import { Request, Response } from "express";
import { GardesService } from "~~/Services/GardesService";
import { CreateGardeDto } from "~~/Types/DTO/CreateGardeDto";

export class GardeController {
    public static getAllGardes = async (req: Request, res: Response) => {
        const gardes = await GardesService.getAllGardes(req.user?.role);
        if (!gardes) {
            res.status(404).json({ message: "Gardes not found" });
            return;
        }
        res.status(200).json(gardes);
    };

    public static createGarde = async (req: Request, res: Response) => {
        try {
            const dto: CreateGardeDto = req.body;

            // Validation
            if (!dto.numero || typeof dto.numero !== 'number') {
                res.status(400).json({ message: "Le numéro de garde est requis et doit être un nombre" });
                return;
            }

            if (!dto.color || dto.color.trim() === "") {
                res.status(400).json({ message: "La couleur est requise" });
                return;
            }

            // Le responsable est optionnel lors de la création
            if (dto.responsable && typeof dto.responsable !== 'number') {
                res.status(400).json({ message: "Le responsable doit être un nombre valide" });
                return;
            }

            const garde = await GardesService.createGarde(dto);
            res.status(201).json(garde);
        } catch (error: any) {
            console.error("Erreur lors de la création de la garde:", error);
            
            // Gestion des erreurs de contrainte unique
            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(409).json({ message: "Une garde avec ce numéro existe déjà" });
                return;
            }

            res.status(500).json({ message: "Erreur lors de la création de la garde" });
        }
    };

    public static deleteGarde = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(400).json({ message: "ID invalide" });
                return;
            }

            const result = await GardesService.deleteGarde(id);

            if (!result) {
                res.status(404).json({ message: "Garde non trouvée" });
                return;
            }

            res.status(200).json({ message: "Garde supprimée avec succès" });
        } catch (error: any) {
            console.error("Erreur lors de la suppression de la garde:", error);
            res.status(500).json({ message: "Erreur lors de la suppression de la garde" });
        }
    };

    public static updateResponsable = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const { responsableId } = req.body;

            if (isNaN(id)) {
                res.status(400).json({ message: "ID de garde invalide" });
                return;
            }

            // responsableId peut être null pour supprimer le responsable
            if (responsableId !== null && (typeof responsableId !== 'number' || isNaN(responsableId))) {
                res.status(400).json({ message: "ID de responsable invalide" });
                return;
            }

            const garde = await GardesService.updateResponsable(id, responsableId);

            if (!garde) {
                res.status(404).json({ message: "Garde non trouvée" });
                return;
            }

            res.status(200).json(garde);
        } catch (error: any) {
            console.error("Erreur lors de la mise à jour du responsable:", error);
            res.status(500).json({ message: "Erreur lors de la mise à jour du responsable" });
        }
    };

    public static getRotation = async (req: Request, res: Response) => {
        try {
            const rotation = await GardesService.getRotation();
            res.status(200).json(rotation);
        } catch (error: any) {
            console.error("Erreur lors de la récupération de la rotation:", error);
            res.status(500).json({ message: "Erreur lors de la récupération de la rotation" });
        }
    };

    public static updateRotation = async (req: Request, res: Response) => {
        try {
            const { reference_date } = req.body;

            // Date calendaire AAAA-MM-JJ qui doit tomber un vendredi (jour de la relève)
            const match = typeof reference_date === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(reference_date) : null;
            const date = match ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])) : null;
            if (!date || date.toISOString().slice(0, 10) !== reference_date) {
                res.status(400).json({ message: "Date de référence invalide (format AAAA-MM-JJ)" });
                return;
            }
            if (date.getUTCDay() !== 5) {
                res.status(400).json({ message: "La date de référence doit être un vendredi" });
                return;
            }

            const rotation = await GardesService.updateRotation(reference_date);
            res.status(200).json(rotation);
        } catch (error: any) {
            console.error("Erreur lors de la mise à jour de la rotation:", error);
            res.status(500).json({ message: "Erreur lors de la mise à jour de la rotation" });
        }
    };
}
