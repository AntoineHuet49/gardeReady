import { apiUrl } from "../constants";
import { instance } from "./axios";

export async function login(email: string, password: string) {
        return await instance.post(
            apiUrl.login,
            {
                email: email,
                password: password,
            },
        );
}
