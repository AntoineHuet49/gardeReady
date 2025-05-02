import { Garde } from "../../../Types/Garde";
import { apiUrl } from "../constants";
import { instance } from "./axios";

export function getAllGardes() {
    return instance.get<Garde[]>(apiUrl.gardes).then((response) => {
        return response.data;
    });
}