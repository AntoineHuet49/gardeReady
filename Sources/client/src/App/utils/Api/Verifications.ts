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
    mail_envoye: boolean;
};

export async function getVerificationHistory() {
    return await instance.get<VerificationHistoryItem[]>(apiUrl.verification);
}

export async function getMyVerifications() {
    return await instance.get<VerificationHistoryItem[]>(`${apiUrl.verification}/mine`);
}

export async function downloadVerificationPdf(id: number) {
    const { data } = await instance.get<Blob>(`${apiUrl.verification}/${id}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `verification-${id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
}

export async function sendVerifications(vehiculeId: string, verifications: VerificationValues[]) {
    return await instance.post(`${apiUrl.verification}/${vehiculeId}`, verifications);
}