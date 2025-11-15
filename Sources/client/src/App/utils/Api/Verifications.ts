import { VerificationValues } from "../../../Types/formValues";
import { apiUrl } from "../constants";
import { instance } from "./axios";

export async function sendVerifications(vehiculeId: string, verifications: VerificationValues[]) {
    return await instance.post(`${apiUrl.verification}/${vehiculeId}`, verifications);
}