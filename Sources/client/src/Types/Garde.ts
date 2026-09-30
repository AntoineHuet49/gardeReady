export type Garde = {
    id: number;
    numero: number;
    color: string;
    responsable?: number;
    responsableUser?: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
    users?: {
        id: number;
        firstname: string;
        lastname: string;
        role: "user" | "admin" | "superAdmin";
    }[];
}

export type GardeRotation = {
    id: number;
    reference_date: string; // AAAA-MM-JJ, un vendredi
}