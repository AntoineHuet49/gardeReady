import { UsersRepository } from "~~/Repositories/UsersRepository";
import { LoginReqDTO } from "~~/Types/DTO/LoginDto";
import jwt from "jsonwebtoken";
import { OperationResult } from "~~/Helpers/OperationResult";
import { TUser } from "~~/Types/User";
import { TUserWithPassword } from "~~/Models/Users";
import bcrypt from "bcrypt";
import { IdTokenClaims } from "@azure/msal-node";
import { getMsalClient, msalScopes, getRedirectUri } from "~~/Utils/AzureAuth";
import { MailerService } from "~~/Services/MailerService";
import { createLogger } from "~~/Utils/Logger";

const logger = createLogger('AuthService');

const SET_PASSWORD_PURPOSE = "set-password";
const INVITATION_EXPIRES_IN = "72h";
const INVALID_LINK_MESSAGE = "Ce lien est invalide ou a expiré. Contactez un administrateur.";

type MicrosoftClaims = IdTokenClaims & {
    email?: string;
    given_name?: string;
    family_name?: string;
};

export class AuthService {
    public static async login(body: LoginReqDTO): Promise<OperationResult<string>> {
        const user: TUser | undefined = await UsersRepository.getOneUserByEmail(body.email);
        const userWithPassword: TUserWithPassword | undefined = await UsersRepository.getOneUserWithPassword(body.email);

        if (user === undefined || userWithPassword === undefined || !userWithPassword.password) {
            return OperationResult.fail("Invalid credentials");
        }

        const isPasswordValid = await this.comparePassword(body.password, userWithPassword.password);
        if (isPasswordValid) {
            const secret = process.env.JWT_SECRET ?? "secret";
            const token = jwt.sign(user, secret, { expiresIn: "1d" });
            return OperationResult.ok(token, "Login successful");
        }
        return OperationResult.fail("Invalid credentials");
    }

    private static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error("Error comparing passwords:", error);
            return false;
        }
    }

    public static getMicrosoftAuthUrl(): Promise<string> {
        return getMsalClient().getAuthCodeUrl({
            scopes: msalScopes,
            redirectUri: getRedirectUri(),
        });
    }

    public static async handleMicrosoftCallback(code: string): Promise<OperationResult<string>> {
        try {
            const authResult = await getMsalClient().acquireTokenByCode({
                code,
                scopes: msalScopes,
                redirectUri: getRedirectUri(),
            });

            if (!authResult?.account) {
                return OperationResult.fail("Authentification Microsoft invalide");
            }

            const claims = authResult.idTokenClaims as MicrosoftClaims;
            const azureOid = authResult.account.localAccountId;
            const email = claims.email ?? authResult.account.username;

            if (!azureOid || !email) {
                return OperationResult.fail("Informations de compte Microsoft incomplètes");
            }

            const user = await this.findOrCreateUser(azureOid, email, claims, authResult.account.name);

            const secret = process.env.JWT_SECRET ?? "secret";
            const token = jwt.sign(user, secret, { expiresIn: "1d" });
            return OperationResult.ok(token, "Login successful");
        } catch (error) {
            console.error("Erreur lors de l'authentification Microsoft:", error);
            return OperationResult.fail("Échec de l'authentification Microsoft");
        }
    }

    private static async findOrCreateUser(
        azureOid: string,
        email: string,
        claims: MicrosoftClaims,
        displayName?: string
    ): Promise<TUser> {
        const existingByOid = await UsersRepository.getOneUserByAzureOid(azureOid);
        if (existingByOid) {
            return existingByOid;
        }

        const existingByEmail = await UsersRepository.getOneUserByEmail(email);
        if (existingByEmail) {
            const linked = await UsersRepository.setAzureOid(existingByEmail.id, azureOid);
            return linked ?? existingByEmail;
        }

        const [fallbackFirstname, ...fallbackLastnameParts] = (displayName ?? email).split(" ");
        const created = await UsersRepository.createUser({
            email,
            firstname: claims.given_name ?? fallbackFirstname ?? "Utilisateur",
            lastname: claims.family_name ?? (fallbackLastnameParts.join(" ") || "SDIS"),
            role: "user",
            garde_id: null,
            azure_oid: azureOid,
        });
        return created;
    }

    /**
     * Envoie à un utilisateur fraîchement créé (sans mot de passe) un lien pour définir son mot de passe.
     * Le jeton est un JWT signé à durée limitée ; il n'est utilisable que tant que le compte n'a pas
     * de mot de passe (usage unique de fait, sans colonne supplémentaire en base).
     */
    public static async sendInvitation(user: TUser, frontendUrl: string): Promise<OperationResult<null>> {
        try {
            // Secret dérivé : un jeton d'invitation ne peut pas servir de jeton de session (verifyToken)
            const secret = `${process.env.JWT_SECRET ?? "secret"}:${SET_PASSWORD_PURPOSE}`;
            const token = jwt.sign({ sub: String(user.id) }, secret, { expiresIn: INVITATION_EXPIRES_IN });
            const link = `${frontendUrl.replace(/\/$/, "")}/?invitation=${encodeURIComponent(token)}`;

            await MailerService.sendMailAsync({
                to: user.email,
                subject: "Véri'Feu - Définissez votre mot de passe",
                text: `Bonjour ${user.firstname},\n\n`
                    + `Un compte Véri'Feu vient d'être créé pour vous.\n`
                    + `Pour l'activer, définissez votre mot de passe en suivant ce lien (valable 72 heures) :\n\n`
                    + `${link}\n\n`
                    + `Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
            });
            return OperationResult.ok(null, "Invitation envoyée");
        } catch (error: any) {
            logger.error("Échec de l'envoi de l'invitation", { userId: user.id, error: error.message });
            return OperationResult.fail("L'e-mail d'invitation n'a pas pu être envoyé");
        }
    }

    public static async setPassword(token: string, password: string): Promise<OperationResult<null>> {
        let userId: number;
        try {
            const secret = `${process.env.JWT_SECRET ?? "secret"}:${SET_PASSWORD_PURPOSE}`;
            userId = Number((jwt.verify(token, secret) as jwt.JwtPayload).sub);
        } catch {
            return OperationResult.fail(INVALID_LINK_MESSAGE);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        // Ne met à jour que si le compte n'a pas encore de mot de passe : le lien devient inutilisable une fois servi
        const updated = await UsersRepository.setPasswordIfUnset(userId, hashedPassword);
        if (!updated) {
            return OperationResult.fail(INVALID_LINK_MESSAGE);
        }
        return OperationResult.ok(null, "Mot de passe défini, vous pouvez vous connecter");
    }
}
