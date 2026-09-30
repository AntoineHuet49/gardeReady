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

export type VehiculeAssignment = {
    id: number;
    shift_date: string; // vendredi de relève, AAAA-MM-JJ
    vehicule_id: number;
    user_id: number;
    vehicule: { id: number; name: string };
    user: { id: number; firstname: string; lastname: string };
}

export type WeekAssignments = { vehicule_id: number; user_ids: number[] }[];

export type GardeRotation = {
    id: number;
    reference_date: string; // AAAA-MM-JJ, un vendredi
}