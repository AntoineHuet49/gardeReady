import { Users } from "~~/Models/Users";

export class UsersRepository {
    public static getAllUsers() {}

    public static async getOneUserByEmail(email: string) {
        const user = await Users.findOne({ where: { email } });
        return user?.dataValues;
    }
}