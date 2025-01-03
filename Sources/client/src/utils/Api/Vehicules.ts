import axios from "axios";
import { apiUrl } from "../constants";
import { Vehicule } from "../../Types/Vehicule";

export async function getAllVehicules() {
    await new Promise(res => setTimeout(res, 5000));
    return await axios.get<Vehicule[]>(apiUrl.vehicule);
}

export async function getVehiculeById(id: string) {
    await new Promise(res => setTimeout(res, 5000));
    return await axios.get<Vehicule>(`${apiUrl.vehicule}/${id}`);
}