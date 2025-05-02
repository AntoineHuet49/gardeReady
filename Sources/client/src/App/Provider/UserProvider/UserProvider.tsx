import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { User } from "../../../Types/User";
import { UserContext } from "./UserContext";
import Loader from "../../../Components/Loader/Loader";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const token = document.cookie
            .split(";")
            .map(c => c.trim())
            .find(c => c.startsWith("token="))
            ?.split("=")[1];

        if (token) {
            try {
                const decoded: User = jwtDecode(token);
                setUser(decoded);
                setIsAuthenticated(true);
                if(decoded.role === "admin") {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error("Erreur de décodage du token:", error);
                setUser(null);
            }
        }
        setIsAuthLoading(false);
    }, []);

    const logout = () => {
        // Supprime le cookie "token"
        document.cookie = "token=; Max-Age=0; path=/";
        setUser(null);
    };

    if (isAuthLoading) {
        return <Loader />;
    }

    return (
        <UserContext.Provider value={{ user, isAuthenticated, isAdmin, logout }}>
            {children}
        </UserContext.Provider>
    );
};

