import axios from "axios";
import { apiUrl } from "../constants";

export async function login(email: string, password: string) {
        return await axios.post(
            apiUrl.login,
            {
                email: email,
                password: password,
            },
            {
                withCredentials: true,
            }
        );
}
