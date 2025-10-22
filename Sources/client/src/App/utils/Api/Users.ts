import { User } from "../../../Types/User";
import { apiUrl } from "../constants";
import { instance } from "./axios";

export interface CreateUserData {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    role: string;
    garde_id: number;
}

export async function getAllUsers() {
    return await instance.get<User[]>(apiUrl.users);
}

export async function createUser(userData: CreateUserData) {
    return await instance.post(apiUrl.users, userData);
}