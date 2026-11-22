export type Kilometrage = {
    id: number;
    vehicule_id: number;
    kilometrage: number;
    motif: string | null;
    created_at: string;
    user?: { id: number; firstname: string; lastname: string };
};
