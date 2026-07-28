import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";

const msalConfig: Configuration = {
    auth: {
        clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
        authority: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID ?? "common"}`,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
    },
};

export const msalClient = new ConfidentialClientApplication(msalConfig);

export const msalScopes = ["openid", "profile", "email", "User.Read"];

export const getRedirectUri = (): string => {
    const redirectUri = process.env.AZURE_AD_REDIRECT_URI;
    if (!redirectUri) {
        throw new Error("AZURE_AD_REDIRECT_URI non configuré");
    }
    return redirectUri;
};
