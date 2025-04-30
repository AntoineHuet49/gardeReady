import { UsersRepository } from "~~/Repositories/UsersRepository";

export class UsersServices {
    public static async getAllUsers() {
        const users = await UsersRepository.getAllUsers();
        return users
    }
}