import { GardesRepository } from "~~/Repositories/GardeRepository"
import { CreateGardeDto } from "~~/Types/DTO/CreateGardeDto";

export class GardesService {
    public static async getAllGardes(requestingUserRole?: string) {
        const gardes = await GardesRepository.GetAll(requestingUserRole === "superAdmin");
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

    public static async updateResponsable(id: number, responsableId: number | null) {
        const garde = await GardesRepository.UpdateResponsable(id, responsableId);
        return garde;
    }

    public static async getRotation() {
        return GardesRepository.GetRotation();
    }

    public static async updateRotation(referenceDate: string) {
        return GardesRepository.UpsertRotation(referenceDate);
    }
}
