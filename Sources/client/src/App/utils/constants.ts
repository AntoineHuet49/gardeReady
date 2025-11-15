export const apiUrl = {
    base: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    login: "/auth/login",
    vehicule: "/vehicules",
    verification: "/vehicules/verifications",
    users: "/users",
    gardes: "/gardes",
};