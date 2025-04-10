import { NextFunction, Request, Response } from "express";
import VehiculesService from "~~/Services/VehiculesService";

export default class VehiculesController {
    static async getAllVehicules(req: Request, res: Response) {
        const vehicules = await VehiculesService.getAllVehicules();
        res.send(vehicules);
    }

    static addVehicule = (req: Request, res: Response) => {
        res.send("add vehicule");
    }
}