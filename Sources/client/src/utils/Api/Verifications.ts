import axios from "axios";
import { apiUrl } from "../constants";
import { VerificationValues } from "../../Types/formValues";

export async function sendVerifications(vehiculeId: string, verifications: VerificationValues[]) {
    return await axios.post(`${apiUrl.verification}/${vehiculeId}`, verifications);
}