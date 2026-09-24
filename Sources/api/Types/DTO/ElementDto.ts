export interface CreateElementDto {
    name: string;
    section_id: number;
    quantite?: number;
}

export interface UpdateElementDto {
    name: string;
    quantite?: number;
}
