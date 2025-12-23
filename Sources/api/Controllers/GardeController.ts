import { Request, Response } from "express";
import { GardesService } from "~~/Services/GardesService";
import { CreateGardeDto } from "~~/Types/DTO/CreateGardeDto";

export class GardeController {
    public static getAllGardes = async (req: Request, res: Response) => {
        const gardes = await GardesService.getAllGardes();
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
}
