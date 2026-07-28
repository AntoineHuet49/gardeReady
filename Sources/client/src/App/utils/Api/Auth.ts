import { apiUrl } from "../constants";
import { instance } from "./axios";

export type AuthProvider = "local" | "microsoft";

export async function getAuthProvider() {
    return await instance.get<{ provider: AuthProvider }>(apiUrl.authProvider).then((response) => response.data.provider);
}

export async function login(email: string, password: string) {
    return await instance.post(
        apiUrl.login,
        {
            email: email,
            password: password,
        },
    );
}

export function getMicrosoftLoginUrl() {
    return `${apiUrl.base}${apiUrl.microsoftLogin}`;
}
