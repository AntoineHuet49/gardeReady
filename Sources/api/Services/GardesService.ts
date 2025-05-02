import { GardesRepository } from "~~/Repositories/GardeRepository"

export class GardesService {
    public static async getAllGardes() {
        const gardes = await GardesRepository.GetAll();
        return gardes;
    }
}