import React, { useCallback, useEffect, useState } from "react";
import { User } from "../../../Types/User";
import { UserContext } from "./UserContext";
import Loader from "../../../Components/Loader/Loader";
import { getMe, logout as logoutRequest } from "../../utils/Api/Auth";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // Le cookie est httpOnly : la session se lit côté serveur (401 = non connecté)
    const refreshUser = useCallback(async () => {
        const me = await getMe().catch(() => null);
        setUser(me);
        return {
            isAdmin: me?.role === "admin" || me?.role === "superAdmin",
            isSuperAdmin: me?.role === "superAdmin",
            user: me,
        };
    }, []);

    useEffect(() => {
        refreshUser().finally(() => setIsAuthLoading(false));
    }, [refreshUser]);

    const logout = async () => {
        await logoutRequest().catch(() => undefined);
        setUser(null);
    };

    if (isAuthLoading) {
        return <Loader />;
    }

    return (
        <UserContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isAdmin: user?.role === "admin" || user?.role === "superAdmin",
                isSuperAdmin: user?.role === "superAdmin",
                logout,
                refreshUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};
