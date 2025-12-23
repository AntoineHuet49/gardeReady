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
}