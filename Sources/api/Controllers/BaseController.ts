import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { TUserPayload } from "~~/Types/User";

export class BaseController {
    protected static getUserPayload(req: Request) {
        const userPayload = jwt.decode(req.headers.cookie?.split("=")[1]!);
        return userPayload as TUserPayload;
    }
}
