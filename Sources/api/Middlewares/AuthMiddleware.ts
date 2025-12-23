import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TUserPayload } from '~~/Types/User';

// Étendre le type Request pour inclure l'utilisateur
declare global {
    namespace Express {
        interface Request {
            user?: TUserPayload;
        }
    }
}

/**
 * Middleware pour vérifier le token JWT
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            res.status(401).json({ message: "Token non fourni" });
            return;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT_SECRET non configuré");
        }

        const decoded = jwt.verify(token, jwtSecret) as TUserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Erreur de vérification du token:", error);
        res.status(401).json({ message: "Token invalide" });
    }
};

/**
 * Middleware pour vérifier que l'utilisateur est admin ou superAdmin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ message: "Non authentifié" });
        return;
    }

    if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
        res.status(403).json({ message: "Accès refusé : rôle admin requis" });
        return;
    }

    next();
};

/**
 * Middleware pour vérifier que l'utilisateur est superAdmin
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ message: "Non authentifié" });
        return;
    }

    if (req.user.role !== "superAdmin") {
        res.status(403).json({ message: "Accès refusé : rôle superAdmin requis" });
        return;
    }

    next();
};
