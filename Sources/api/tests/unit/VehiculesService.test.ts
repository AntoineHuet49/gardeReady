import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VehiculesRepository from '~~/Repositories/VehiculesRepository';
import { ElementsRepository } from '~~/Repositories/ElementsRepository';
import { GardesRepository } from '~~/Repositories/GardeRepository';
import { MailerService } from '~~/Services/MailerService';
import VehiculesService from '~~/Services/VehiculesService';
import type { TUserPayload } from '~~/Types/User';

vi.mock('~~/Repositories/VehiculesRepository', () => ({
    default: { getAllVehicules: vi.fn(), getOneByIdWithSections: vi.fn(), createVehicule: vi.fn(), deleteVehicule: vi.fn() },
}));
vi.mock('~~/Repositories/ElementsRepository', () => ({ ElementsRepository: { getOneById: vi.fn() } }));
vi.mock('~~/Repositories/GardeRepository', () => ({ GardesRepository: { getResponsable: vi.fn() } }));
vi.mock('~~/Services/MailerService', () => ({ MailerService: { sendMailAsync: vi.fn() } }));

const repo = vi.mocked(VehiculesRepository);
const user = { id: 2, email: 'u@sdis49.fr', firstname: 'Jean', lastname: 'Dupont', role: 'user', garde_id: 1, azure_oid: null, iat: 0, exp: 0 } as TUserPayload;
const vehicule = { id: 1, name: 'VSAV n°2 (Écouflant)' };
let dir: string;

beforeEach(() => {
    vi.clearAllMocks();
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'verifeu-'));
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

describe('CRUD véhicule', () => {
    it('délègue la lecture de l’arbre au repository', async () => {
        const arbre = { ...vehicule, sections: [] };
        repo.getOneByIdWithSections.mockResolvedValue(arbre);
        expect(await VehiculesService.getOneById(1)).toBe(arbre);
    });

    it('refuse un nom vide', async () => {
        await expect(VehiculesService.createVehicule('  ')).rejects.toThrow('Le nom du véhicule est requis');
        expect(repo.createVehicule).not.toHaveBeenCalled();
    });

    it('lève « Véhicule non trouvé » si la suppression ne trouve rien', async () => {
        repo.deleteVehicule.mockResolvedValue(null);
        await expect(VehiculesService.deleteVehicule(9)).rejects.toThrow('Véhicule non trouvé');
    });
});

describe('generatePdf', () => {
    it('écrit un PDF non vide, en créant le dossier si besoin', async () => {
        vi.mocked(ElementsRepository.getOneById).mockResolvedValue({ name: 'Thermomètre', quantite: 2 } as never);
        const filePath = path.join(dir, 'sous-dossier', 'verif.pdf');

        await VehiculesService.generatePdf(
            vehicule,
            [{ elementId: 1, status: 'OK' }, { elementId: 2, status: 'KO', comment: 'cassé' }],
            filePath,
            user,
        );

        const pdf = fs.readFileSync(filePath);
        expect(pdf.length).toBeGreaterThan(1000);
        expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
        expect(ElementsRepository.getOneById).toHaveBeenCalledWith(2);
    });
});

describe('sendVerificationMail', () => {
    it('envoie le PDF en pièce jointe au responsable de la garde, avec un nom de fichier assaini', async () => {
        const filePath = path.join(dir, 'verif.pdf');
        fs.writeFileSync(filePath, '%PDF-test');
        vi.mocked(GardesRepository.getResponsable).mockResolvedValue({ email: 'chef@sdis49.fr' } as never);

        await VehiculesService.sendVerificationMail(user, vehicule, filePath);

        const message = vi.mocked(MailerService.sendMailAsync).mock.calls[0][0];
        expect(message.to).toBe('chef@sdis49.fr');
        expect(message.attachments![0]).toMatchObject({
            ContentType: 'application/pdf',
            Base64Content: Buffer.from('%PDF-test').toString('base64'),
        });
        expect(message.attachments![0].Filename).toMatch(/^Verif_VSAV_n_2_Ecouflant_\d{8}\.pdf$/);
    });

    it('échoue si l’agent n’a pas de garde ou si la garde n’a pas de responsable', async () => {
        await expect(VehiculesService.sendVerificationMail({ ...user, garde_id: null }, vehicule, 'x')).rejects.toThrow('Aucune garde');
        vi.mocked(GardesRepository.getResponsable).mockResolvedValue(undefined as never);
        await expect(VehiculesService.sendVerificationMail(user, vehicule, 'x')).rejects.toThrow('Aucun responsable');
        expect(MailerService.sendMailAsync).not.toHaveBeenCalled();
    });
});

describe('removePdf', () => {
    it('supprime le fichier et ignore un fichier absent', () => {
        const filePath = path.join(dir, 'a.pdf');
        fs.writeFileSync(filePath, 'x');
        VehiculesService.removePdf(filePath);
        expect(fs.existsSync(filePath)).toBe(false);
        expect(() => VehiculesService.removePdf(filePath)).not.toThrow();
    });
});
