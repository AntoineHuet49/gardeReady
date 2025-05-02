import { User } from "./User";

export type LoginValues = {
    email: string;
    password: string;
};

export type VerificationValues = {
    elementId: number;
    status: string;
    comment?: string;
};

export type UsersValues = Omit<User, "id"> & {
    password: string;
    passwordConfirmation: string;
};
