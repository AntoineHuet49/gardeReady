import { Request, Response } from 'express';
import { UsersServices } from '~~/Services/UsersServices';
import { CreateUserDTO } from '~~/Types/DTO/CreateUserDto';

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

    public static async createUser(req: Request, res: Response): Promise<void> {
        try {
            const userData: CreateUserDTO = req.body;
            
            // Validation basique des champs requis
            if (!userData.email || !userData.password || !userData.firstname || 
                !userData.lastname || !userData.role || !userData.garde_id) {
                res.status(400).json({ 
                    message: "Tous les champs sont requis" 
                });
                return;
            }

            // Validation du format email
            const emailRegex = /^[\w-.]+@sdis49\.fr$/;
            if (!emailRegex.test(userData.email)) {
                res.status(400).json({ 
                    message: "L'email doit être du domaine sdis49.fr" 
                });
                return;
            }

            // Validation du mot de passe
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
            if (!passwordRegex.test(userData.password)) {
                res.status(400).json({ 
                    message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre" 
                });
                return;
            }

            const result = await UsersServices.createUser(userData);

            if (result.success) {
                res.status(201).json({
                    message: result.message,
                    user: result.data
                });
            } else {
                res.status(400).json({
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Error in createUser controller:", error);
            res.status(500).json({
                message: "Erreur interne du serveur"
            });
        }
    }
}