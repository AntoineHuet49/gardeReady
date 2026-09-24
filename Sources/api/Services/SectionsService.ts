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
