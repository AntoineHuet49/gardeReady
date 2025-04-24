import { Request, Response } from "express";
import VehiculesService from "~~/Services/VehiculesService";
import jwt from "jsonwebtoken";
import { TUserPayload } from "~~/Types/User";
import { BaseController } from "./BaseController";
import * as path from 'path';

export default class VehiculesController extends BaseController {
    public static async getAllVehicules(req: Request, res: Response): Promise<void> {
        const vehicules = await VehiculesService.getAllVehicules();
        res.send(vehicules);
    }

    public static async getOneVehiculeWithElements(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const vehicule = await VehiculesService.getOneByIdWithElements(id);
        res.send(vehicule);
    }

    public static addVehicule(req: Request, res: Response) {
        res.send("add vehicule");
    }

    public static async validateVehicule(req: Request, res: Response): Promise<void> {
        const id = parseInt(req.params.id);
        const body = req.body;
        const userPayload: TUserPayload = BaseController.getUserPayload(req);
        const filePath = path.join(process.cwd(), '/public/verification.pdf');
        const vehicule = await VehiculesService.getOneById(id);
        
        if (vehicule === undefined) {
            res.status(404).send("Vehicule not found");
            return;
        }

        VehiculesService.generatePdf(vehicule, body, filePath, userPayload);
        VehiculesService.sendVerificationMail(userPayload, vehicule);
        VehiculesService.removePdf(filePath);

        res.send("Vehicule validated");
    }
}