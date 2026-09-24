import { Request, Response } from "express";
import { HttpCode } from "~~/Helpers/HttpCode";
import { AuthService } from "~~/Services/AuthService";
import { getAuthProvider } from "~~/Utils/AuthProvider";

export class AuthController {
    public static getAuthProvider(req: Request, res: Response) {
        res.send({ provider: getAuthProvider() });
    }

    public static async login(req: Request, res: Response) {
        const result = await AuthService.login(req.body);
        if (result.success) {
            res.cookie('token', result.data, {
                maxAge: 1000 * 60 * 60 * 24,
            });
        } else {
            res.status(HttpCode.BadRequest);
        }
        res.send(result.message);
    }

    public static async redirectToMicrosoft(req: Request, res: Response) {
        const authUrl = await AuthService.getMicrosoftAuthUrl();
        res.redirect(authUrl);
    }

    public static async microsoftCallback(req: Request, res: Response) {
        const code = req.query.code;
        const frontendUrl = process.env.FRONTEND_URL ?? "/";

        if (typeof code !== "string") {
            res.redirect(`${frontendUrl}?authError=1`);
            return;
        }

        const result = await AuthService.handleMicrosoftCallback(code);
        if (result.success) {
            res.cookie('token', result.data, {
                maxAge: 1000 * 60 * 60 * 24,
            });
            res.redirect(frontendUrl);
        } else {
            res.redirect(`${frontendUrl}?authError=1`);
        }
    }

    public static async setPassword(req: Request, res: Response) {
        const { token, password } = req.body;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (typeof token !== "string" || typeof password !== "string" || !passwordRegex.test(password)) {
            res.status(HttpCode.BadRequest).json({
                message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
            });
            return;
        }

        const result = await AuthService.setPassword(token, password);
        res.status(result.success ? HttpCode.Ok : HttpCode.BadRequest).json({ message: result.message });
    }
}
