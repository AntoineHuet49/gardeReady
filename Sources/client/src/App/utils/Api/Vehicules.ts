import { Vehicule } from "../../../Types/Vehicule";
import { apiUrl } from "../constants";
import { instance } from "./axios";

export async function getAllVehicules() {
    return await instance.get<Vehicule[]>(apiUrl.vehicule);
}

export async function getVehiculeById(id: string) {
    return await instance.get<Vehicule>(`${apiUrl.vehicule}/${id}`);
}