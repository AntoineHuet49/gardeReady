import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { createLogger } from '~~/Utils/Logger';

const logger = createLogger('Audit');

const VERBS: Record<string, string> = { POST: 'create', PUT: 'update', PATCH: 'update', DELETE: 'delete' };
const SENSITIVE_KEY = /pass|token|secret/i;
const MAX_STRING = 200;
const MAX_DETAILS = 1000;

/** Type d'appareil, OS et navigateur depuis le user-agent (suffisant pour du suivi, pas du fingerprinting). */
function parseDevice(req: Request) {
    const ua = req.headers['user-agent'] ?? '';
    const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS'
        : /Android/.test(ua) ? 'Android'
        : /Windows/.test(ua) ? 'Windows'
        : /Mac OS X/.test(ua) ? 'macOS'
        : /Linux/.test(ua) ? 'Linux' : 'inconnu';
    const browser = /Edg\//.test(ua) ? 'Edge'
        : /OPR\//.test(ua) ? 'Opera'
        : /Firefox\//.test(ua) ? 'Firefox'
        : /Chrome\//.test(ua) ? 'Chrome'
        : /Safari\//.test(ua) ? 'Safari' : 'inconnu';
    const type = /iPad|Tablet/.test(ua) ? 'tablet' : /Mobi|iPhone|Android/.test(ua) ? 'mobile' : 'desktop';
    return { type, os, browser, pwa: req.headers['x-display-mode'] === 'standalone' };
}

/** Corps de requête sans secrets, chaînes tronquées ; les corps non-JSON (photo binaire) sont ignorés. */
function safeBody(body: unknown): string | undefined {
    if (!body || typeof body !== 'object' || Buffer.isBuffer(body) || Object.keys(body).length === 0) return undefined;
    const json = JSON.stringify(body, (key, value) => {
        if (SENSITIVE_KEY.test(key)) return '[masqué]';
        return typeof value === 'string' && value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
    });
    return json.length > MAX_DETAILS ? `${json.slice(0, MAX_DETAILS)}…` : json;
}

/** `users/:id/role` + PUT -> `users.role.update` ; les routes auth gardent leur nom (`auth.login`). */
function actionName(req: Request): string {
    const segments = `${req.baseUrl}${req.route?.path ?? req.path}`
        .split('/').filter(s => s && s !== 'api' && !s.startsWith(':'));
    if (segments[0] !== 'auth') segments.push(VERBS[req.method] ?? req.method.toLowerCase());
    return segments.join('.');
}

/**
 * Journal d'activité fonctionnel : une ligne JSON par action (écriture ou connexion), émise une fois
 * la réponse envoyée, donc avec l'utilisateur authentifié et le code HTTP final. Les lectures (GET) sont ignorées.
 */
export const auditLog = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    const requestId = randomUUID();
    res.setHeader('x-request-id', requestId);
    res.on('finish', () => {
        const isMicrosoftCallback = req.method === 'GET' && req.originalUrl.startsWith('/api/auth/microsoft/callback');
        if (req.method === 'GET' && !isMicrosoftCallback) return;
        if (req.method === 'OPTIONS' || req.method === 'HEAD') return;

        // req.user est posé par verifyToken ; pour un login, le contrôleur dépose l'utilisateur dans res.locals.
        const user = req.user ?? res.locals.auditUser;
        const action = actionName(req);
        // Les redirections 3xx du callback Microsoft : succès = redirigé sans authError
        const success = res.statusCode < 400 && !String(res.getHeader('location') ?? '').includes('authError');

        logger.audit(`${user ? `${user.role} ${user.firstname} ${user.lastname}` : 'anonyme'} ${action} ${success ? 'ok' : 'échec'}`, {
            action,
            success,
            status: res.statusCode,
            userId: user?.id,
            role: user?.role ?? 'anonyme',
            userName: user ? `${user.firstname} ${user.lastname}` : undefined,
            gardeId: user?.garde_id ?? undefined,
            entityId: req.params.id ?? req.params.shiftDate,
            // Identifiant tenté sur un login raté : utile pour repérer du bruteforce (@action:auth.login @success:false)
            email: action.startsWith('auth.login') && !success ? req.body?.email : undefined,
            details: safeBody(req.body),
            device: parseDevice(req),
            requestId,
            durationMs: Date.now() - start,
            env: process.env.RAILWAY_ENVIRONMENT_NAME ?? process.env.NODE_ENV,
        });
    });
    next();
};
