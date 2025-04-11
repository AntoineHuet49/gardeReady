import { Request, Response } from "express";
import { HttpCode } from "~~/Helpers/HttpCode";
import { AuthService } from "~~/Services/AuthService";

export class AuthController {
    public static register(req: Request, res: Response) {
        console.log(req);
    }

    public static async login(req: Request, res: Response) {
        const result = await AuthService.login(req.body);
        if (result.success) {
            res.cookie('token', result.data, {
                maxAge: 1000 * 60 * 60 * 24,
            })
        }
        else {
            res.status(HttpCode.BadRequest);
        }
        res.send(result.message);
    }
}