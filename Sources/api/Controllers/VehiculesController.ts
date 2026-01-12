import { Request, Response } from "express";
import VehiculesService from "~~/Services/VehiculesService";
import { TUserPayload } from "~~/Types/User";
import { BaseController } from "./BaseController";
import * as path from 'path';
import asyncHandler from "express-async-handler";
import { HttpCode } from "~~/Helpers/HttpCode";
import { CreateVehiculeDto } from "~~/Types/DTO/CreateVehiculeDto";
import { createLogger } from "~~/Utils/Logger";

const logger = createLogger("VehiculesController");

export default class VehiculesController extends BaseController {
    public static async getAllVehicules(req: Request, res: Response): Promise<void> {
        const vehicules = await VehiculesService.getAllVehicules();
        res.send(vehicules);
    }

    public static async getOneVehiculeWithElements(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const vehicule = await VehiculesService.getOneById(id);
        res.send(vehicule);
    }

    public static addVehicule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const dto = req.body as CreateVehiculeDto;

            if (!dto.name || dto.name.trim() === "") {
                res.status(HttpCode.BadRequest).json({ error: "Le nom du véhicule est requis" });
                return;
            }

            const vehicule = await VehiculesService.createVehicule(dto.name);
            res.status(HttpCode.Created).json(vehicule);
        } catch (error) {
            console.error("Erreur lors de la création du véhicule:", error);
            res.status(HttpCode.InternalServerError).json({ error: "Erreur interne du serveur" });
        }
    });

    public static deleteVehicule = asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id)) {
                res.status(HttpCode.BadRequest).json({ error: "L'ID du véhicule est invalide" });
                return;
            }

            await VehiculesService.deleteVehicule(id);
            res.status(HttpCode.Ok).json({ message: "Véhicule supprimé avec succès" });
        } catch (error) {
            console.error("Erreur lors de la suppression du véhicule:", error);
            if ((error as Error).message === "Véhicule non trouvé") {
                res.status(HttpCode.NotFound).json({ error: "Véhicule non trouvé" });
            } else {
                res.status(HttpCode.InternalServerError).json({ error: "Erreur interne du serveur" });
            }
        }
    });

    public static async validateVehicule(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const body = req.body;
        const userPayload: TUserPayload = BaseController.getUserPayload(req);
        
        // Générer un nom de fichier unique pour éviter les conflits
        const timestamp = Date.now();
        const publicDir = path.join(process.cwd(), 'public');
        const filePath = path.join(publicDir, `verification-${timestamp}.pdf`);
        
        const vehicule = await VehiculesService.getOneById(id);
        
        if (vehicule === undefined) {
            res.status(404).send("Vehicule not found");
            return;
        }

        try {
            // Générer le PDF
            await VehiculesService.generatePdf(vehicule, body, filePath, userPayload);
            
            // Envoyer l'email avec le PDF en pièce jointe
            await VehiculesService.sendVerificationMail(userPayload, vehicule, filePath);
            
            logger.success(`Vérification validée pour le véhicule ${vehicule.name} par ${userPayload.firstname} ${userPayload.lastname}`);
            res.send("Vehicule validated");
        } catch (error) {
            logger.error("Erreur lors de la validation du véhicule", error);
            res.status(500).send("Erreur lors de la validation du véhicule");
        } finally {
            // Supprimer le fichier temporaire
            VehiculesService.removePdf(filePath);
        }
    }
}