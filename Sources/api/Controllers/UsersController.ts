import { Request, Response } from 'express';
import { UsersServices } from '~~/Services/UsersServices';
import { CreateUserDTO } from '~~/Types/DTO/CreateUserDto';
import { getAuthProvider } from '~~/Utils/AuthProvider';

export class UsersController {
    public static async getAllUsers(req: Request, res: Response) {
        // Récupérer le rôle de l'utilisateur connecté depuis req.user (injecté par le middleware)
        const requestingUserRole = req.user?.role;
        
        const users = await UsersServices.getAllUsers(requestingUserRole);
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
            if (!userData.email || !userData.firstname ||
                !userData.lastname || !userData.role) {
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

            // En mode login local, un mot de passe est requis à la création (les comptes Microsoft
            // sont provisionnés automatiquement au premier login, sans mot de passe)
            if (getAuthProvider() === "local") {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
                if (!userData.password || !passwordRegex.test(userData.password)) {
                    res.status(400).json({
                        message: "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
                    });
                    return;
                }
            }

            // Empêcher les admins normaux de créer des superAdmin
            if (userData.role === "superAdmin" && req.user?.role !== "superAdmin") {
                res.status(403).json({ 
                    message: "Seul un superAdmin peut créer un compte superAdmin" 
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

    public static async updateUserRole(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.id);
            const { role: newRole } = req.body;
            const requestingUserRole = req.user?.role;

            if (!newRole) {
                res.status(400).json({ message: "Le rôle est requis" });
                return;
            }

            const result = await UsersServices.updateUserRole(userId, newRole, requestingUserRole);

            if (result.success) {
                res.status(200).json({
                    message: result.message,
                    user: result.data
                });
            } else {
                res.status(400).json({
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Error in updateUserRole controller:", error);
            res.status(500).json({
                message: "Erreur interne du serveur"
            });
        }
    }

    public static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({ message: "ID invalide" });
                return;
            }

            const requestingUserId = req.user?.id;
            const requestingUserRole = req.user?.role;

            const result = await UsersServices.deleteUser(userId, requestingUserId, requestingUserRole);

            if (result.success) {
                res.status(200).json({
                    message: result.message
                });
            } else {
                res.status(400).json({
                    message: result.message
                });
            }
        } catch (error) {
            console.error("Error in deleteUser controller:", error);
            res.status(500).json({
                message: "Erreur interne du serveur"
            });
        }
    }
}