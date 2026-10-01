import { OperationResult } from "~~/Helpers/OperationResult";
import { SectionsRepository } from "~~/Repositories/SectionsRepository";
import { createLogger } from "~~/Utils/Logger";

const logger = createLogger("SectionsService");

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
export const SECTION_NOT_FOUND = "Section non trouvée";

// Type réel de l'image déduit de ses premiers octets (on ne fait pas confiance au Content-Type)
function detectImageMime(data: Buffer): string | null {
    if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return "image/jpeg";
    if (data.length >= 8 && data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
    if (data.length >= 12 && data.toString("ascii", 0, 4) === "RIFF" && data.toString("ascii", 8, 12) === "WEBP") return "image/webp";
    return null;
}

export default class SectionsService {
    // Déplace une section sous un autre parent du même véhicule, ou à la racine du véhicule (parentId = null)
    public static async moveSection(sectionId: number, parentId: number | null): Promise<OperationResult<void>> {
        // Chemins racine -> section ; path[0] est la racine, qui porte le vehicule_id
        const path = await SectionsRepository.getSectionPath(sectionId);
        if (path.length === 0) {
            return OperationResult.fail(SECTION_NOT_FOUND);
        }
        const vehiculeId = path[0].vehicule_id as number;
        const currentParentId = path[path.length - 1].parent_section_id;

        if (parentId === null) {
            if (currentParentId === null) {
                return OperationResult.fail("La section est déjà à la racine du véhicule");
            }
        } else {
            const parentPath = await SectionsRepository.getSectionPath(parentId);
            if (parentPath.length === 0) {
                return OperationResult.fail(SECTION_NOT_FOUND);
            }
            if (parentPath[0].vehicule_id !== vehiculeId) {
                return OperationResult.fail("Une section ne peut pas être déplacée vers un autre véhicule");
            }
            // Le parent (ou un de ses ancêtres) est la section elle-même : cela créerait un cycle
            if (parentPath.some((s) => s.id === sectionId)) {
                return OperationResult.fail("Une section ne peut pas être déplacée dans elle-même ou dans l'une de ses sous-sections");
            }
            if (parentId === currentParentId) {
                return OperationResult.fail("La section est déjà dans cette section");
            }
        }

        await SectionsRepository.moveSection(sectionId, parentId, vehiculeId);
        logger.success("Section déplacée", { sectionId, parentId, vehiculeId });
        return OperationResult.ok();
    }

    public static async getPhoto(sectionId: number): Promise<OperationResult<{ photo: Buffer; mime: string }>> {
        const section = await SectionsRepository.getPhoto(sectionId);
        if (!section?.photo || !section.photo_mime) {
            return OperationResult.fail("Aucune photo pour cette section");
        }
        return OperationResult.ok({ photo: section.photo, mime: section.photo_mime });
    }

    public static async setPhoto(sectionId: number, data: unknown): Promise<OperationResult<void>> {
        if (!Buffer.isBuffer(data) || data.length === 0) {
            return OperationResult.fail("Image manquante (formats acceptés : JPEG, PNG, WebP)");
        }
        if (data.length > MAX_PHOTO_SIZE) {
            return OperationResult.fail("Image trop volumineuse (5 Mo maximum)");
        }
        const mime = detectImageMime(data);
        if (!mime) {
            return OperationResult.fail("Format d'image non supporté (JPEG, PNG ou WebP uniquement)");
        }

        const updated = await SectionsRepository.setPhoto(sectionId, data, mime);
        if (!updated) {
            return OperationResult.fail(SECTION_NOT_FOUND);
        }
        logger.success("Photo de section enregistrée", { sectionId, mime, size: data.length });
        return OperationResult.ok();
    }

    public static async deletePhoto(sectionId: number): Promise<OperationResult<void>> {
        const updated = await SectionsRepository.setPhoto(sectionId, null, null);
        if (!updated) {
            return OperationResult.fail(SECTION_NOT_FOUND);
        }
        logger.success("Photo de section supprimée", { sectionId });
        return OperationResult.ok();
    }
}
