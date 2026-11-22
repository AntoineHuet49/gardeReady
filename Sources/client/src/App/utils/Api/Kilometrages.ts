import { Kilometrage } from "../../../Types/Kilometrage";
import { apiUrl } from "../constants";
import { instance } from "./axios";

/** Historique des relevés d'un véhicule (admin), du plus récent au plus ancien. */
export function getKilometrages(vehiculeId: number) {
    return instance.get<Kilometrage[]>(`${apiUrl.vehicule}/${vehiculeId}/kilometrages`).then((response) => response.data);
}

export function addKilometrage(vehiculeId: number, data: { kilometrage: number; motif?: string }) {
    return instance.post<Kilometrage>(`${apiUrl.vehicule}/${vehiculeId}/kilometrages`, data).then((response) => response.data);
}
