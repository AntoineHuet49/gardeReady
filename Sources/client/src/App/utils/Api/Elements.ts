import { Element } from "../../../Types/Element";
import { instance } from "./axios";

export async function createElement(elementData: { name: string; section_id: number }) {
    return await instance.post<Element>('/elements', elementData);
}

export async function updateElement(id: number, elementData: { name: string }) {
    return await instance.put<Element>(`/elements/${id}`, elementData);
}

export async function deleteElement(id: number) {
    return await instance.delete(`/elements/${id}`);
}