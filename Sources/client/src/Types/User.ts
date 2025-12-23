export type User = {
    id: number;
    email: string;
    firstname: string;
    lastname: string;
    role: "user" | "admin" | "superAdmin";
    garde_id: number;
};