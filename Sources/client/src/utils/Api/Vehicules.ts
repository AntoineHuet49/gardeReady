import axios from "axios";
import { apiUrl } from "../constants";
import { Vehicule } from "../../Types/Vehicule";

export async function getAllVehicules() {
    return await axios.get<Vehicule[]>(apiUrl.vehicule);
}

export async function getVehiculeById(id: string) {
    return await axios.get<Vehicule>(`${apiUrl.vehicule}/${id}`);
}