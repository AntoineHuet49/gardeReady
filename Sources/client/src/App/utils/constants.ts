export const apiUrl = {
    base: import.meta.env.VITE_API_URL || "/api",
    authProvider: "/auth/provider",
    login: "/auth/login",
    microsoftLogin: "/auth/microsoft/login",
    vehicule: "/vehicules",
    verification: "/vehicules/verifications",
    users: "/users",
    gardes: "/gardes",
};