import { apiUrl } from "../constants";
import { Section } from "../../../Types/Section";
import { instance } from "./axios";

export async function createSection(sectionData: { 
    name: string; 
    vehicule_id?: number; 
    parent_section_id?: number 
}) {
    return await instance.post<Section>(`${apiUrl.base}/sections`, sectionData);
}

export async function updateSection(id: number, sectionData: { name: string }) {
    return await instance.put<Section>(`${apiUrl.base}/sections/${id}`, sectionData);
}

export async function deleteSection(id: number) {
    return await instance.delete(`${apiUrl.base}/sections/${id}`);
}