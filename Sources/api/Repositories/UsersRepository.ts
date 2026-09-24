import { Users } from "~~/Models";
import { TUserWithPassword } from "~~/Models/Users";
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

    public static async getOneUserByAzureOid(azureOid: string): Promise<TUser | undefined> {
        const user = await Users.findOne({ where: { azure_oid: azureOid } });
        return user?.dataValues;
    }

    public static async setAzureOid(userId: number, azureOid: string): Promise<TUser | undefined> {
        const user = await Users.findByPk(userId);
        if (!user) {
            return undefined;
        }
        user.azure_oid = azureOid;
        await user.save();
        return user.dataValues;
    }

    public static async createUser(userData: CreateUserDTO): Promise<TUser> {
        const user = await Users.create(userData);
        return user.dataValues;
    }

    public static async checkEmailExists(email: string, excludeUserId?: number): Promise<boolean> {
        const user = await Users.findOne({
            where: excludeUserId
                ? { email, id: { [Op.ne]: excludeUserId } }
                : { email },
        });
        return !!user;
    }

    public static async updateUser(userId: number, data: { email: string; firstname: string; lastname: string }): Promise<TUser | null> {
        const user = await Users.findByPk(userId);
        if (!user) {
            return null;
        }
        user.email = data.email;
        user.firstname = data.firstname;
        user.lastname = data.lastname;
        await user.save();
        return user.dataValues;
    }

    public static async updateUserGarde(userId: number, gardeId: number | null): Promise<TUser | null> {
        const user = await Users.findByPk(userId);
        if (!user) {
            return null;
        }
        user.garde_id = gardeId;
        await user.save();
        return user.dataValues;
    }

    public static async updateUserRole(userId: number, newRole: string): Promise<TUser | null> {
        const user = await Users.findByPk(userId);
        if (!user) {
            return null;
        }
        user.role = newRole as "user" | "admin" | "superAdmin";
        await user.save();
        return user.dataValues;
    }

    public static async getOneUserById(userId: number): Promise<TUser | undefined> {
        const user = await Users.findByPk(userId);
        return user?.dataValues;
    }

    public static async deleteUser(userId: number): Promise<boolean> {
        const user = await Users.findByPk(userId);
        if (!user) {
            return false;
        }
        await user.destroy();
        return true;
    }
}