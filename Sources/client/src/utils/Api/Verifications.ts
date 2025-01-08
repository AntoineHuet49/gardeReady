import { apiUrl } from "../constants";
import { VerificationValues } from "../../Types/formValues";
import { instance } from "./axios";

export async function sendVerifications(vehiculeId: string, verifications: VerificationValues[]) {
    return await instance.post(`${apiUrl.verification}/${vehiculeId}`, verifications);
}