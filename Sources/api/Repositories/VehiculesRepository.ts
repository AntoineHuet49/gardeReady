import { Vehicules } from "~~/Models/Vehicules";

export default class VehiculesRepository {
    static async getAllVehicules() {
        const vehicules = await Vehicules.findAll();
        return vehicules;
    }
}