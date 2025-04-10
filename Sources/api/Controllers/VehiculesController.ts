import { NextFunction, Request, Response } from "express";

export default class VehiculesController {
    static getAllVehicules = (req: Request, res: Response) => {
        res.send("vehicules");
    }

    static addVehicule = (req: Request, res: Response) => {
        res.send("add vehicule");
    }
}