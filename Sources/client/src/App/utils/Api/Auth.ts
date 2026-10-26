import { apiUrl } from "../constants";
import { instance } from "./axios";
import { User } from "../../../Types/User";

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

export async function getMe() {
    return await instance.get<User>(apiUrl.me).then((response) => response.data);
}

export async function logout() {
    return await instance.post(apiUrl.logout);
}

export async function setPassword(token: string, password: string) {
    return await instance.post<{ message: string }>(apiUrl.setPassword, { token, password });
}

export function getMicrosoftLoginUrl() {
    return `${apiUrl.base}${apiUrl.microsoftLogin}`;
}
