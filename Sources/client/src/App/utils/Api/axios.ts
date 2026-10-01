import axios from "axios";
import { apiUrl } from "../constants";
import { removeCookie } from "../getCookie";

export const instance = axios.create({
    baseURL: apiUrl.base,
    withCredentials: true,
    // Permet au journal d'activité serveur de distinguer la PWA installée du navigateur
    headers: window.matchMedia("(display-mode: standalone)").matches ? { "X-Display-Mode": "standalone" } : {},
})

instance.interceptors.response.use((response) => {
    return response
}, (error) => {
    if (error.response?.status === 401) {
        removeCookie('token');
        document.location.href = "/";
    }
    return Promise.reject(error);
})