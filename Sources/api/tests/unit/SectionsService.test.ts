import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SectionsRepository } from '~~/Repositories/SectionsRepository';
import SectionsService, { MAX_PHOTO_SIZE, SECTION_NOT_FOUND } from '~~/Services/SectionsService';

vi.mock('~~/Repositories/SectionsRepository', () => ({
    SectionsRepository: { getSectionPath: vi.fn(), moveSection: vi.fn(), getPhoto: vi.fn(), setPhoto: vi.fn() },
}));

const repo = vi.mocked(SectionsRepository);
beforeEach(() => vi.clearAllMocks());

// Arbre du véhicule 1 : 1 (racine) > 2 > 3, et 4 (racine). Véhicule 2 : 10 (racine).
type Node = { id: number; vehicule_id: number | null; parent_section_id: number | null };
const nodes: Record<number, Node> = {
    1: { id: 1, vehicule_id: 1, parent_section_id: null },
    2: { id: 2, vehicule_id: null, parent_section_id: 1 },
    3: { id: 3, vehicule_id: null, parent_section_id: 2 },
    4: { id: 4, vehicule_id: 1, parent_section_id: null },
    10: { id: 10, vehicule_id: 2, parent_section_id: null },
};
function pathOf(id: number): Node[] {
    const node = nodes[id];
    if (!node) return [];
    return node.parent_section_id ? [...pathOf(node.parent_section_id), node] : [node];
}

describe('moveSection', () => {
    beforeEach(() => {
        repo.getSectionPath.mockImplementation((async (id: number) => pathOf(id)) as never);
    });

    it('déplace une sous-section sous une autre section du même véhicule', async () => {
        const result = await SectionsService.moveSection(3, 4);
        expect(result.success).toBe(true);
        expect(repo.moveSection).toHaveBeenCalledWith(3, 4, 1);
    });

    it('remonte une sous-section à la racine du véhicule', async () => {
        expect((await SectionsService.moveSection(3, null)).success).toBe(true);
        expect(repo.moveSection).toHaveBeenCalledWith(3, null, 1);
    });

    it.each([
        [99, 4, SECTION_NOT_FOUND],
        [3, 99, SECTION_NOT_FOUND],
        [1, null, 'La section est déjà à la racine du véhicule'],
        [3, 2, 'La section est déjà dans cette section'],
        [2, 10, 'Une section ne peut pas être déplacée vers un autre véhicule'],
        [1, 3, "Une section ne peut pas être déplacée dans elle-même ou dans l'une de ses sous-sections"],
        [2, 2, "Une section ne peut pas être déplacée dans elle-même ou dans l'une de ses sous-sections"],
    ])('refuse de déplacer %s sous %s', async (id, parent, message) => {
        expect(await SectionsService.moveSection(id, parent)).toMatchObject({ success: false, message });
        expect(repo.moveSection).not.toHaveBeenCalled();
    });
});

describe('photos', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')]);

    it.each([
        [png, 'image/png'],
        [jpeg, 'image/jpeg'],
        [webp, 'image/webp'],
    ])('détecte le type réel de l’image (%#)', async (data, mime) => {
        repo.setPhoto.mockResolvedValue(1);
        expect((await SectionsService.setPhoto(5, data)).success).toBe(true);
        expect(repo.setPhoto).toHaveBeenCalledWith(5, data, mime);
    });

    it.each([
        ['vide', Buffer.alloc(0)],
        ['pas un buffer', 'texte'],
        ['format inconnu (GIF)', Buffer.from('GIF89a')],
        ['trop volumineuse', Buffer.concat([jpeg, Buffer.alloc(MAX_PHOTO_SIZE)])],
    ])('refuse une image %s', async (_label, data) => {
        expect((await SectionsService.setPhoto(5, data)).success).toBe(false);
        expect(repo.setPhoto).not.toHaveBeenCalled();
    });

    it('échoue si la section n’existe pas', async () => {
        repo.setPhoto.mockResolvedValue(0);
        expect(await SectionsService.setPhoto(99, png)).toMatchObject({ success: false, message: SECTION_NOT_FOUND });
        expect(await SectionsService.deletePhoto(99)).toMatchObject({ success: false, message: SECTION_NOT_FOUND });
    });

    it('supprime la photo en remettant les colonnes à null', async () => {
        repo.setPhoto.mockResolvedValue(1);
        expect((await SectionsService.deletePhoto(5)).success).toBe(true);
        expect(repo.setPhoto).toHaveBeenCalledWith(5, null, null);
    });

    it('renvoie la photo et son type, ou un échec s’il n’y en a pas', async () => {
        repo.getPhoto.mockResolvedValueOnce({ photo: png, photo_mime: 'image/png' } as never);
        expect(await SectionsService.getPhoto(5)).toMatchObject({ success: true, data: { photo: png, mime: 'image/png' } });
        repo.getPhoto.mockResolvedValueOnce({ photo: null, photo_mime: null } as never);
        expect((await SectionsService.getPhoto(5)).success).toBe(false);
    });
});
