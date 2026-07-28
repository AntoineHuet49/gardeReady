import { Request, Response, NextFunction } from "express";

export type AuthProvider = "local" | "microsoft";

/**
 * Bascule entre le login local (email/mot de passe) et Microsoft Entra ID (SDIS),
 * en attendant que le SDIS49 autorise officiellement l'App Registration côté IT
 * (voir docs/AZURE_AD_SETUP.md). Un seul provider est actif à la fois.
 */
export const getAuthProvider = (): AuthProvider => {
    return process.env.AUTH_PROVIDER === "microsoft" ? "microsoft" : "local";
};

/**
 * Renvoie 404 si le provider demandé n'est pas l'actif. Le contrôle se fait à
 * chaque requête (et non à l'import du router) pour ne pas dépendre de l'ordre
 * de chargement de dotenv dans app.ts.
 */
export const requireAuthProvider = (provider: AuthProvider) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (getAuthProvider() !== provider) {
            res.status(404).end();
            return;
        }
        next();
    };
};
