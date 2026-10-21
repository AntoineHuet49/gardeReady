import axios from "axios";
import { apiUrl } from "../constants";

export const instance = axios.create({
    baseURL: apiUrl.base,
    withCredentials: true,
    // Permet au journal d'activité serveur de distinguer la PWA installée du navigateur
    headers: window.matchMedia("(display-mode: standalone)").matches ? { "X-Display-Mode": "standalone" } : {},
})

instance.interceptors.response.use((response) => {
    return response
}, (error) => {
    // /auth/me renvoie 401 pour un visiteur non connecté : pas de redirection (boucle de rechargement)
    if (error.response?.status === 401 && error.config?.url !== apiUrl.me) {
        document.location.href = "/";
    }
    return Promise.reject(error);
})