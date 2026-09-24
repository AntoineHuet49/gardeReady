import { Request, Response } from 'express';
import { UsersServices } from '~~/Services/UsersServices';
import { CreateUserDTO } from '~~/Types/DTO/CreateUserDto';
import { UpdateUserDTO } from '~~/Types/DTO/UpdateUserDto';
import { getAuthProvider } from '~~/Utils/AuthProvider';
import { AuthService } from '~~/Services/AuthService';

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
            const { email, firstname, lastname, role, garde_id } = req.body;
            const userData: CreateUserDTO = { email, firstname, lastname, role, garde_id: garde_id ?? null };
            
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

            // Empêcher les admins normaux de créer des superAdmin
            if (userData.role === "superAdmin" && req.user?.role !== "superAdmin") {
                res.status(403).json({ 
                    message: "Seul un superAdmin peut créer un compte superAdmin" 
                });
                return;
            }

            const result = await UsersServices.createUser(userData);

            if (result.success) {
                // En mode local, l'utilisateur reçoit un lien pour définir son mot de passe.
                // Un échec d'envoi ne défait pas la création : l'admin est prévenu via invitationSent.
                let invitationSent: boolean | null = null;
                if (getAuthProvider() === "local") {
                    const frontendUrl = process.env.FRONTEND_URL ?? req.get("origin") ?? `${req.protocol}://${req.get("host")}`;
                    invitationSent = (await AuthService.sendInvitation(result.data!, frontendUrl)).success;
                }
                res.status(201).json({
                    message: result.message,
                    user: result.data,
                    invitationSent
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

    public static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({ message: "ID invalide" });
                return;
            }

            const userData: UpdateUserDTO = req.body;

            if (!userData.email || !userData.firstname || !userData.lastname) {
                res.status(400).json({
                    message: "Tous les champs sont requis"
                });
                return;
            }

            const emailRegex = /^[\w-.]+@sdis49\.fr$/;
            if (!emailRegex.test(userData.email)) {
                res.status(400).json({
                    message: "L'email doit être du domaine sdis49.fr"
                });
                return;
            }

            const requestingUserRole = req.user?.role;
            const result = await UsersServices.updateUser(userId, userData, requestingUserRole);

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
            console.error("Error in updateUser controller:", error);
            res.status(500).json({
                message: "Erreur interne du serveur"
            });
        }
    }

    public static async updateUserGarde(req: Request, res: Response): Promise<void> {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(400).json({ message: "ID invalide" });
                return;
            }

            const { garde_id } = req.body;
            const gardeId = garde_id === null || garde_id === undefined ? null : Number(garde_id);
            if (gardeId !== null && isNaN(gardeId)) {
                res.status(400).json({ message: "garde_id invalide" });
                return;
            }

            const requestingUserRole = req.user?.role;
            const result = await UsersServices.updateUserGarde(userId, gardeId, requestingUserRole);

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
            console.error("Error in updateUserGarde controller:", error);
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