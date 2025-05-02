import { createContext, useContext } from "react";
import { User } from "../../../Types/User";

type UserContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    logout: () => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
