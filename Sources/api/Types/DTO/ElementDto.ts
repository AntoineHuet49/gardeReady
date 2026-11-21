export interface CreateElementDto {
    name: string;
    section_id: number;
    quantite?: number;
    pression_min?: number | null;
}

export interface UpdateElementDto {
    name: string;
    quantite?: number;
    pression_min?: number | null;
}
