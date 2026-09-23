import { ConfidentialClientApplication } from "@azure/msal-node";

let msalClient: ConfidentialClientApplication | undefined;

/**
 * Instancié à la première utilisation (et non à l'import) : MSAL lève une ClientAuthError
 * (invalid_client_credential) dès le constructeur si le client secret est vide, ce qui ferait
 * crasher l'API au démarrage en mode AUTH_PROVIDER=local où les variables Azure ne sont pas définies.
 */
export const getMsalClient = (): ConfidentialClientApplication => {
    if (!msalClient) {
        const clientId = process.env.AZURE_AD_CLIENT_ID;
        const clientSecret = process.env.AZURE_AD_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
            throw new Error("AZURE_AD_CLIENT_ID / AZURE_AD_CLIENT_SECRET non configurés");
        }
        msalClient = new ConfidentialClientApplication({
            auth: {
                clientId,
                authority: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID ?? "common"}`,
                clientSecret,
            },
        });
    }
    return msalClient;
};

export const msalScopes = ["openid", "profile", "email", "User.Read"];

export const getRedirectUri = (): string => {
    const redirectUri = process.env.AZURE_AD_REDIRECT_URI;
    if (!redirectUri) {
        throw new Error("AZURE_AD_REDIRECT_URI non configuré");
    }
    return redirectUri;
};
