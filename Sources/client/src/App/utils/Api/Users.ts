import { User } from "../../../Types/User";
import { apiUrl } from "../constants";
import { instance } from "./axios";

export interface CreateUserData {
    email: string;
    password?: string;
    firstname: string;
    lastname: string;
    role: string;
    garde_id: number;
}

export async function getAllUsers() {
    return await instance.get<User[]>(apiUrl.users);
}

export interface UpdateUserData {
    email: string;
    firstname: string;
    lastname: string;
}

export async function createUser(userData: CreateUserData) {
    return await instance.post(apiUrl.users, userData);
}

export async function updateUser(userId: number, userData: UpdateUserData) {
    return await instance.put(`${apiUrl.users}/${userId}`, userData);
}

export async function updateUserRole(userId: number, role: string) {
    return await instance.patch(`${apiUrl.users}/${userId}/role`, { role });
}

export async function deleteUser(userId: number) {
    return await instance.delete(`${apiUrl.users}/${userId}`);
}