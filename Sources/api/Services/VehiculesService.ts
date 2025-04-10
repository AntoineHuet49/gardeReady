import VehiculesRepository from "~~/Repositories/VehiculesRepository";

export default class VehiculesService {
    static getAllVehicules() {
        return VehiculesRepository.getAllVehicules();
    }
}