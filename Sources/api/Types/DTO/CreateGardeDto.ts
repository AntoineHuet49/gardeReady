export type CreateGardeDto = {
    numero: number;
    color: string;
    responsable?: number; // Optionnel car la garde peut être créée vide
};
