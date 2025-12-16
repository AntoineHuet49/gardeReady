export type Garde = {
    id: number;
    name: string;
    color: string;
    responsable: number;
    responsableUser?: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
    };
}