import { UsersRepository } from "~~/Repositories/UsersRepository";
import { LoginReqDTO } from "~~/Types/DTO/LoginDto";
import jwt from "jsonwebtoken";
import { OperationResult } from "~~/Helpers/OperationResult";
import { TUser } from "~~/Types/User";
import { TUserWithPassword } from "~~/Models/Users";

export class AuthService {
    public static async login(body: LoginReqDTO): Promise<OperationResult<string>> {
        const user: TUser | undefined = await UsersRepository.getOneUserByEmail(body.email);
        const userWithPassword: TUserWithPassword | undefined = await UsersRepository.getOneUserWithPassword(body.email);

        if (user === undefined || userWithPassword === undefined) {
            return OperationResult.fail("Invalid credentials");
        }

        if(this.isSamePassword(body.password, userWithPassword.password)) {
            const secret = process.env.TOKEN_SECRET ?? "secret";
            const token = jwt.sign(user, secret, { expiresIn: "1d" });
            return OperationResult.ok(token, "Login successful");
        }
        return OperationResult.fail("Invalid credentials");
    }

    private static isSamePassword(password: string, userPassword: string) {
        if (password === userPassword) {
            return true;
        }
        return false;
    }
}