import { Garde } from "../../../Types/Garde";
import { apiUrl } from "../constants";
import { instance } from "./axios";

export function getAllGardes() {
    return instance.get<Garde[]>(apiUrl.gardes).then((response) => {
        return response.data;
    });
}

export function createGarde(data: { numero: number; color: string; responsable?: number }) {
    return instance.post<Garde>(apiUrl.gardes, data).then((response) => {
        return response.data;
    });
}

export function deleteGarde(id: number) {
    return instance.delete(`${apiUrl.gardes}/${id}`).then((response) => {
        return response.data;
    });
}