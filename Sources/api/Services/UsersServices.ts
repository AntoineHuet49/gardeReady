import { UsersRepository } from "~~/Repositories/UsersRepository";
import { CreateUserDTO } from "~~/Types/DTO/CreateUserDto";
import { OperationResult } from "~~/Helpers/OperationResult";
import { TUser } from "~~/Types/User";
import bcrypt from "bcrypt";

export class UsersServices {
    public static async getAllUsers(requestingUserRole?: string) {
        // Si l'utilisateur est superAdmin, il voit tous les comptes
        // Sinon, on masque les comptes superAdmin
        if (requestingUserRole === "superAdmin") {
            const users = await UsersRepository.getAllUsers();
            return users;
        } else {
            const users = await UsersRepository.getAllUsersExcludingSuperAdmin();
            return users;
        }
    }

    public static async createUser(userData: CreateUserDTO): Promise<OperationResult<TUser>> {
        try {
            // Vérifier si l'email existe déjà
            const emailExists = await UsersRepository.checkEmailExists(userData.email);
            if (emailExists) {
                return OperationResult.fail("Cet email est déjà utilisé");
            }

            // Crypter le mot de passe
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            // Créer l'utilisateur avec le mot de passe crypté
            const userToCreate = {
                ...userData,
                password: hashedPassword
            };

            const newUser = await UsersRepository.createUser(userToCreate);
            return OperationResult.ok(newUser, "Utilisateur créé avec succès");

        } catch (error) {
            console.error("Error creating user:", error);
            return OperationResult.fail("Erreur lors de la création de l'utilisateur");
        }
    }

    public static async updateUserRole(userId: number, newRole: string, requestingUserRole?: string): Promise<OperationResult<TUser>> {
        try {
            // Vérifier que le rôle est valide
            if (!["user", "admin", "superAdmin"].includes(newRole)) {
                return OperationResult.fail("Rôle invalide");
            }

            // Seul un superAdmin peut attribuer le rôle superAdmin
            if (newRole === "superAdmin" && requestingUserRole !== "superAdmin") {
                return OperationResult.fail("Seul un superAdmin peut attribuer le rôle superAdmin");
            }

            const updatedUser = await UsersRepository.updateUserRole(userId, newRole);
            
            if (!updatedUser) {
                return OperationResult.fail("Utilisateur non trouvé");
            }

            return OperationResult.ok(updatedUser, "Rôle mis à jour avec succès");
        } catch (error) {
            console.error("Error updating user role:", error);
            return OperationResult.fail("Erreur lors de la mise à jour du rôle");
        }
    }
}