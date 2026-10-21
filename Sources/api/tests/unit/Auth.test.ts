import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { UsersRepository } from '~~/Repositories/UsersRepository';
import { MailerService } from '~~/Services/MailerService';
import { AuthService } from '~~/Services/AuthService';
import { requireAdmin, requireSuperAdmin, verifyToken } from '~~/Middlewares/AuthMiddleware';
import type { TUserPayload } from '~~/Types/User';

vi.mock('~~/Repositories/UsersRepository', () => ({
    UsersRepository: {
        getOneUserByEmail: vi.fn(),
        getOneUserWithPassword: vi.fn(),
        setPasswordIfUnset: vi.fn(),
    },
}));
vi.mock('~~/Services/MailerService', () => ({ MailerService: { sendMailAsync: vi.fn() } }));

const repo = vi.mocked(UsersRepository);
const SECRET = 'secret-unitaire';
const user = { id: 7, email: 'agent@sdis49.fr', firstname: 'Jean', lastname: 'Dupont', role: 'user', garde_id: 2, azure_oid: null };

beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = SECRET;
});

describe('AuthService.login', () => {
    beforeEach(async () => {
        repo.getOneUserByEmail.mockResolvedValue(user);
        repo.getOneUserWithPassword.mockResolvedValue({ ...user, password: await bcrypt.hash('Motdepasse1', 4) });
    });

    it('renvoie un JWT signé contenant le profil (sans mot de passe) si les identifiants sont bons', async () => {
        const result = await AuthService.login({ email: user.email, password: 'Motdepasse1' });

        expect(result.success).toBe(true);
        const payload = jwt.verify(result.data!, SECRET) as jwt.JwtPayload;
        expect(payload).toMatchObject(user);
        expect(payload).not.toHaveProperty('password');
        expect(payload.exp! - payload.iat!).toBe(24 * 3600);
    });

    it('échoue avec un mauvais mot de passe', async () => {
        const result = await AuthService.login({ email: user.email, password: 'mauvais' });
        expect(result).toMatchObject({ success: false, message: 'Invalid credentials' });
        expect(result.data).toBeUndefined();
    });

    it('échoue pour un email inconnu', async () => {
        repo.getOneUserByEmail.mockResolvedValue(undefined);
        repo.getOneUserWithPassword.mockResolvedValue(undefined);
        const result = await AuthService.login({ email: 'inconnu@sdis49.fr', password: 'Motdepasse1' });
        expect(result).toMatchObject({ success: false, message: 'Invalid credentials' });
    });

    it('échoue pour un compte sans mot de passe (invitation non utilisée / compte Microsoft)', async () => {
        repo.getOneUserWithPassword.mockResolvedValue({ ...user, password: null });
        const result = await AuthService.login({ email: user.email, password: '' });
        expect(result.success).toBe(false);
    });
});

describe('AuthService invitation / setPassword', () => {
    it("envoie un lien d'invitation dont le jeton permet de définir le mot de passe", async () => {
        const result = await AuthService.sendInvitation(user, 'https://app.test/');
        expect(result.success).toBe(true);

        const mail = vi.mocked(MailerService.sendMailAsync).mock.calls[0][0];
        expect(mail.to).toBe(user.email);
        const token = decodeURIComponent(/invitation=([^\s]+)/.exec(mail.text)![1]);
        expect(mail.text).toContain('https://app.test/?invitation=');

        repo.setPasswordIfUnset.mockResolvedValue(true);
        const set = await AuthService.setPassword(token, 'Nouveau1');
        expect(set.success).toBe(true);
        expect(repo.setPasswordIfUnset).toHaveBeenCalledWith(7, expect.stringMatching(/^\$2[ab]\$12\$/));
    });

    it("signale l'échec d'envoi sans lever d'exception", async () => {
        vi.mocked(MailerService.sendMailAsync).mockRejectedValue(new Error('smtp'));
        const result = await AuthService.sendInvitation(user, 'https://app.test');
        expect(result.success).toBe(false);
    });

    it("refuse un jeton de session utilisé comme jeton d'invitation", async () => {
        const sessionToken = jwt.sign({ sub: '7' }, SECRET);
        const result = await AuthService.setPassword(sessionToken, 'Nouveau1');
        expect(result.success).toBe(false);
        expect(repo.setPasswordIfUnset).not.toHaveBeenCalled();
    });

    it('refuse un lien déjà utilisé (mot de passe déjà défini)', async () => {
        const token = jwt.sign({ sub: '7' }, `${SECRET}:set-password`);
        repo.setPasswordIfUnset.mockResolvedValue(false);
        const result = await AuthService.setPassword(token, 'Nouveau1');
        expect(result.success).toBe(false);
    });
});

// Faux req/res Express minimalistes pour les middlewares
function run(middleware: (req: Request, res: Response, next: NextFunction) => void, req: Partial<Request>) {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
    const next = vi.fn();
    middleware(req as Request, res as unknown as Response, next);
    return { res, next, req: req as Request };
}

describe('verifyToken', () => {
    it('401 sans cookie token', () => {
        const { res, next } = run(verifyToken, { cookies: {} });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('401 avec un token signé par un autre secret', () => {
        const { res, next } = run(verifyToken, { cookies: { token: jwt.sign(user, 'autre') } });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('401 avec un token expiré', () => {
        const expired = jwt.sign({ ...user, exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
        const { res, next } = run(verifyToken, { cookies: { token: expired } });
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('pose req.user et appelle next avec un token valide', () => {
        const { next, req } = run(verifyToken, { cookies: { token: jwt.sign(user, SECRET) } });
        expect(next).toHaveBeenCalled();
        expect(req.user).toMatchObject(user);
    });
});

describe('requireAdmin / requireSuperAdmin', () => {
    const asRole = (role: string) => ({ user: { ...user, role } as TUserPayload });

    it('401 si verifyToken n’a pas posé req.user', () => {
        expect(run(requireAdmin, {}).res.status).toHaveBeenCalledWith(401);
        expect(run(requireSuperAdmin, {}).res.status).toHaveBeenCalledWith(401);
    });

    it('403 pour un simple user', () => {
        const { res, next } = run(requireAdmin, asRole('user'));
        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it.each(['admin', 'superAdmin'])('laisse passer %s', (role) => {
        expect(run(requireAdmin, asRole(role)).next).toHaveBeenCalled();
    });

    it('requireSuperAdmin refuse un admin et accepte un superAdmin', () => {
        expect(run(requireSuperAdmin, asRole('admin')).res.status).toHaveBeenCalledWith(403);
        expect(run(requireSuperAdmin, asRole('superAdmin')).next).toHaveBeenCalled();
    });
});
