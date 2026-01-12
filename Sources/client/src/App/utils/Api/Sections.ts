import { apiUrl } from "../constants";
import { Section } from "../../../Types/Section";
import { instance } from "./axios";
import { createLogger } from "../Logger";

const logger = createLogger('API/Sections');

export async function createSection(sectionData: { 
    name: string; 
    vehicule_id?: number; 
    parent_section_id?: number 
}) {
    logger.debug("Création section");
    logger.sent("Données envoyées", sectionData);
    logger.http(`URL cible: ${apiUrl.base}/sections`);
    
    try {
        const response = await instance.post<Section>('/sections', sectionData);
        logger.success("Section créée", response.data);
        return response;
    } catch (error: unknown) {
        logger.axiosError("Erreur lors de la création de la section", error);
        throw error;
    }
}

export async function updateSection(id: number, sectionData: { name: string }) {
    return await instance.put<Section>(`/sections/${id}`, sectionData);
}

export async function deleteSection(id: number) {
    return await instance.delete(`/sections/${id}`);
}