import { UsersRepository } from "~~/Repositories/UsersRepository";
import { LoginReqDTO } from "~~/Types/DTO/LoginDto";
import jwt from "jsonwebtoken";
import { OperationResult } from "~~/Helpers/OperationResult";
import { TUser } from "~~/Types/User";
import { TUserWithPassword } from "~~/Models/Users";
import bcrypt from "bcrypt";

export class AuthService {
    public static async login(body: LoginReqDTO): Promise<OperationResult<string>> {
        const user: TUser | undefined = await UsersRepository.getOneUserByEmail(body.email);
        const userWithPassword: TUserWithPassword | undefined = await UsersRepository.getOneUserWithPassword(body.email);

        if (user === undefined || userWithPassword === undefined) {
            return OperationResult.fail("Invalid credentials");
        }

        const isPasswordValid = await this.comparePassword(body.password, userWithPassword.password);
        if(isPasswordValid) {
            const secret = process.env.TOKEN_SECRET ?? "secret";
            const token = jwt.sign(user, secret, { expiresIn: "1d" });
            return OperationResult.ok(token, "Login successful");
        }
        return OperationResult.fail("Invalid credentials");
    }

    private static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error("Error comparing passwords:", error);
            return false;
        }
    }
}