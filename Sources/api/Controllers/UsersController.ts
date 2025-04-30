import { Request, Response } from 'express';
import { UsersServices } from '~~/Services/UsersServices';

export class UsersController {
    public static async getAllUsers(req: Request, res: Response) {
        const users = await UsersServices.getAllUsers();
        if (users) {
            res.status(200).json(users);
        }
        else {
            res.status(404).json({ message: "No users found" });
        }
    }
}