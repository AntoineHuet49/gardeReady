import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Mailjet from 'node-mailjet';
import { FeedbackService } from '~~/Services/FeedbackService';
import { MailerService } from '~~/Services/MailerService';
import type { TUserPayload } from '~~/Types/User';

// Transport Mailjet simulé : aucune requête réseau
const request = vi.fn();
vi.mock('node-mailjet', () => ({ default: { apiConnect: vi.fn(() => ({ post: () => ({ request }) })) } }));

const user = { id: 4, role: 'user', firstname: 'Jean', lastname: 'Dupont', email: 'jean@sdis49.fr' } as TUserPayload;

beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
});
afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
});

describe('FeedbackService.createIssue', () => {
    beforeEach(() => {
        vi.stubEnv('GITHUB_TOKEN', 'ghp_test');
        vi.stubEnv('GITHUB_REPO', 'org/depot');
    });

    it('crée une issue GitHub sans données personnelles', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ number: 42 }) });
        vi.stubGlobal('fetch', fetchMock);

        const result = await FeedbackService.createIssue({ type: 'bug', message: 'Le bouton plante\ndétails', page: '/vehicules' }, user);

        expect(result).toMatchObject({ success: true, data: { number: 42 } });
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://api.github.com/repos/org/depot/issues');
        expect(init.headers.Authorization).toBe('Bearer ghp_test');
        const body = JSON.parse(init.body);
        expect(body.title).toBe('[Bug] Le bouton plante');
        expect(body.labels).toEqual(['bug']);
        expect(body.body).toContain('#4 (user)');
        expect(body.body).not.toContain('Dupont');
        expect(body.body).not.toContain('jean@sdis49.fr');
    });

    it('tronque le titre d’une idée à 70 caractères', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ number: 1 }) });
        vi.stubGlobal('fetch', fetchMock);
        await FeedbackService.createIssue({ type: 'idea', message: 'x'.repeat(100) }, user);
        const body = JSON.parse(fetchMock.mock.calls[0][1].body);
        expect(body.title).toBe(`[Idée] ${'x'.repeat(70)}…`);
        expect(body.labels).toEqual(['enhancement']);
    });

    it('échoue si GitHub répond une erreur', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, text: async () => 'Bad credentials' }));
        expect((await FeedbackService.createIssue({ type: 'bug', message: 'hello' }, user)).success).toBe(false);
    });

    it('échoue sans appeler GitHub si le service n’est pas configuré', async () => {
        vi.stubEnv('GITHUB_TOKEN', '');
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        expect((await FeedbackService.createIssue({ type: 'bug', message: 'hello' }, user)).success).toBe(false);
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe('MailerService.sendMailAsync', () => {
    beforeEach(() => {
        vi.stubEnv('MAILJET_API_KEY', 'k');
        vi.stubEnv('MAILJET_API_SECRET', 's');
        vi.stubEnv('MAILJET_SENDER_EMAIL', 'noreply@verifeu.fr');
    });

    it('envoie le message et ses pièces jointes via Mailjet', async () => {
        request.mockResolvedValue({ body: { Messages: [{ Status: 'success', To: [{ MessageID: 1 }] }] } });
        const attachment = { ContentType: 'application/pdf', Filename: 'a.pdf', Base64Content: 'QQ==' };

        await MailerService.sendMailAsync({ to: 'chef@sdis49.fr', subject: 'Sujet', text: 'Corps', attachments: [attachment] });

        expect(Mailjet.apiConnect).toHaveBeenCalledWith('k', 's');
        const [message] = request.mock.calls[0][0].Messages;
        expect(message).toMatchObject({
            From: { Email: 'noreply@verifeu.fr' },
            To: [{ Email: 'chef@sdis49.fr' }],
            Subject: 'Sujet',
            TextPart: 'Corps',
            Attachments: [attachment],
        });
    });

    it('lève une erreur si Mailjet signale un échec', async () => {
        request.mockResolvedValue({ body: { Messages: [{ Status: 'error', Errors: ['adresse invalide'] }] } });
        await expect(MailerService.sendMailAsync({ to: 'x', subject: 's', text: 't' })).rejects.toThrow('Échec de l\'envoi de l\'email');
    });

    it('lève une erreur si la configuration Mailjet est incomplète', async () => {
        vi.stubEnv('MAILJET_API_KEY', '');
        await expect(MailerService.sendMailAsync({ to: 'x', subject: 's', text: 't' })).rejects.toThrow('Configuration Mailjet incomplète');
        expect(request).not.toHaveBeenCalled();
    });
});
