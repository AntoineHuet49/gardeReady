import { User } from "./User";

export type LoginValues = {
    email: string;
    password: string;
};

export type VerificationValues = {
    elementId: number;
    status: "OK" | "KO";
    comment?: string;
};

export type UsersValues = Omit<User, "id">;

export type SetPasswordValues = {
    password: string;
    passwordConfirmation: string;
};
