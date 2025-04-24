import { TUserWithPassword } from "~~/Models/Users";

export type TUser = Omit<TUserWithPassword, 'password'>
  
export type TUserPayload = TUser & {
    iat: number;
    exp: number;
}