import { Request, Response } from "express";
import { GardesService } from "~~/Services/GardesService";

export class GardeController {
    public static getAllGardes = async (req: Request, res: Response) => {
        const gardes = await GardesService.getAllGardes();
        if (!gardes) {
            res.status(404).json({ message: "Gardes not found" });
            return;
        }
        res.status(200).json(gardes);
    };
}
