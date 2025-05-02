import { User } from "../../../Types/User";
import { apiUrl } from "../constants";
import { instance } from "./axios";

export async function getAllUsers() {
    return await instance.get<User[]>(apiUrl.users);
}