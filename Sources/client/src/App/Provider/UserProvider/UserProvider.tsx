import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { User } from "../../../Types/User";
import { UserContext } from "./UserContext";
import Loader from "../../../Components/Loader/Loader";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
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
                setIsAdmin(decoded.role === "admin" || decoded.role === "superAdmin");
                setIsSuperAdmin(decoded.role === "superAdmin");
            } catch (error) {
                console.error("Erreur de décodage du token:", error);
                setUser(null);
                setIsAuthenticated(false);
                setIsAdmin(false);
                setIsSuperAdmin(false);
            }
        } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsSuperAdmin(false);
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
        setIsSuperAdmin(false);
    };

    const refreshUser = (): { isAdmin: boolean; isSuperAdmin: boolean; user: User | null } => {
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
                const userIsAdmin = decoded.role === "admin" || decoded.role === "superAdmin";
                const userIsSuperAdmin = decoded.role === "superAdmin";
                setIsAdmin(userIsAdmin);
                setIsSuperAdmin(userIsSuperAdmin);
                
                return { isAdmin: userIsAdmin, isSuperAdmin: userIsSuperAdmin, user: decoded };
            } catch (error) {
                console.error("Erreur de décodage du token:", error);
                setUser(null);
                setIsAuthenticated(false);
                setIsAdmin(false);
                setIsSuperAdmin(false);
                return { isAdmin: false, isSuperAdmin: false, user: null };
            }
        } else {
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
            setIsSuperAdmin(false);
            return { isAdmin: false, isSuperAdmin: false, user: null };
        }
    };

    if (isAuthLoading) {
        return <Loader />;
    }

    return (
        <UserContext.Provider value={{ user, isAuthenticated, isAdmin, isSuperAdmin, logout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

