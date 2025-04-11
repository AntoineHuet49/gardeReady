import { UsersRepository } from "~~/Repositories/UsersRepository";
import { LoginReqDTO } from "~~/Types/DTO/LoginDto";
import jwt from "jsonwebtoken";
import { OperationResult } from "~~/Helpers/OperationResult";
import { TUser } from "~~/Models/Users";

export class AuthService {
    public static async login(body: LoginReqDTO): Promise<OperationResult<TUser>> {
        const user = await UsersRepository.getOneUserByEmail(body.email);
        if(this.isSamePassword(body.password, user.password)) {
            const secret = process.env.TOKEN_SECRET ?? "secret";
            const token = jwt.sign({ id: user.id }, secret, { expiresIn: "1d" });
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