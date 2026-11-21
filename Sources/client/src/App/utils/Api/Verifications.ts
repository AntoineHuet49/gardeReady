import { VerificationValues } from "../../../Types/formValues";
import { apiUrl } from "../constants";
import { instance } from "./axios";

export type VerificationHistoryItem = {
    id: number;
    created_at: string;
    vehicule: { id: number; name: string };
    user: { id: number; firstname: string; lastname: string };
    garde: { id: number; numero: number } | null;
    results: { element: string; status: string; comment: string }[];
};

export async function getVerificationHistory() {
    return await instance.get<VerificationHistoryItem[]>(apiUrl.verification);
}

export async function sendVerifications(vehiculeId: string, verifications: VerificationValues[]) {
    return await instance.post(`${apiUrl.verification}/${vehiculeId}`, verifications);
}