export interface CreateUserDTO {
    email: string;
    firstname: string;
    lastname: string;
    role: string;
    garde_id?: number | null;
    azure_oid?: string | null;
}