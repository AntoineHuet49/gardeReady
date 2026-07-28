import { UsersRepository } from "~~/Repositories/UsersRepository";
import { LoginReqDTO } from "~~/Types/DTO/LoginDto";
import jwt from "jsonwebtoken";
import { OperationResult } from "~~/Helpers/OperationResult";
import { TUser } from "~~/Types/User";
import { TUserWithPassword } from "~~/Models/Users";
import bcrypt from "bcrypt";
import { IdTokenClaims } from "@azure/msal-node";
import { msalClient, msalScopes, getRedirectUri } from "~~/Utils/AzureAuth";

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
        return msalClient.getAuthCodeUrl({
            scopes: msalScopes,
            redirectUri: getRedirectUri(),
        });
    }

    public static async handleMicrosoftCallback(code: string): Promise<OperationResult<string>> {
        try {
            const authResult = await msalClient.acquireTokenByCode({
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
}
