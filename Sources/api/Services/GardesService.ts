import { GardesRepository } from "~~/Repositories/GardeRepository"
import { CreateGardeDto } from "~~/Types/DTO/CreateGardeDto";

export class GardesService {
    public static async getAllGardes() {
        const gardes = await GardesRepository.GetAll();
        return gardes;
    }

    public static async createGarde(data: CreateGardeDto) {
        const garde = await GardesRepository.Create(data);
        return garde;
    }

    public static async deleteGarde(id: number) {
        const result = await GardesRepository.Delete(id);
        return result;
    }
}