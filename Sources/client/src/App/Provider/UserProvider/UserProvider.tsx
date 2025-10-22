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

    const checkAndSetUser = () => {
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
                setIsAdmin(decoded.role === "admin");
            } catch (error) {
                console.error("Erreur de décodage du token:", error);
                setUser(null);
                setIsAuthenticated(false);
                setIsAdmin(false);
            }
        } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
        }
    };

    useEffect(() => {
        checkAndSetUser();
        setIsAuthLoading(false);
    }, []);

    const logout = () => {
        // Supprime le cookie "token"
        document.cookie = "token=; Max-Age=0; path=/";
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    const refreshUser = (): { isAdmin: boolean; user: User | null } => {
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
                const userIsAdmin = decoded.role === "admin";
                setIsAdmin(userIsAdmin);
                
                return { isAdmin: userIsAdmin, user: decoded };
            } catch (error) {
                console.error("Erreur de décodage du token:", error);
                setUser(null);
                setIsAuthenticated(false);
                setIsAdmin(false);
                return { isAdmin: false, user: null };
            }
        } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            return { isAdmin: false, user: null };
        }
    };

    if (isAuthLoading) {
        return <Loader />;
    }

    return (
        <UserContext.Provider value={{ user, isAuthenticated, isAdmin, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

