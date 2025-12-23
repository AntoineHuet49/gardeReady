import { Request, Response } from "express";
import { TUserPayload } from "~~/Types/User";

export class BaseController {
    protected static getUserPayload(req: Request): TUserPayload {
        if (!req.user) {
            throw new Error("Utilisateur non authentifié");
        }
        return req.user;
    }
}
