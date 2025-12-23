import { TUserWithPassword } from "~~/Models/Users";
import { Users } from "~~/Models";
import { TUser } from "~~/Types/User";
import { CreateUserDTO } from "~~/Types/DTO/CreateUserDto";
import { Op } from "sequelize";

export class UsersRepository {
    public static async getAllUsers() {
        const users = await Users.findAll();
        return users;
    }

    public static async getAllUsersExcludingSuperAdmin() {
        const users = await Users.findAll({
            where: {
                role: {
                    [Op.ne]: "superAdmin"
                }
            }
        });
        return users;
    }

    public static async getOneUserByEmail(email: string): Promise<TUser | undefined> {
        const user = await Users.findOne({ where: { email } });
        return user?.dataValues;
    }

    public static async getOneUserWithPassword(email: string): Promise<TUserWithPassword | undefined> {
        const user = await Users.scope('withPassword').findOne({ where: { email } });
        return user?.dataValues;
    }

    public static async createUser(userData: CreateUserDTO): Promise<TUser> {
        const user = await Users.create(userData);
        return user.dataValues;
    }

    public static async checkEmailExists(email: string): Promise<boolean> {
        const user = await Users.findOne({ where: { email } });
        return !!user;
    }
}