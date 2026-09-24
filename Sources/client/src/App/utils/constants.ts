export const apiUrl = {
    base: import.meta.env.VITE_API_URL || "/api",
    authProvider: "/auth/provider",
    login: "/auth/login",
    setPassword: "/auth/set-password",
    microsoftLogin: "/auth/microsoft/login",
    vehicule: "/vehicules",
    verification: "/vehicules/verifications",
    users: "/users",
    gardes: "/gardes",
    feedback: "/feedback",
};