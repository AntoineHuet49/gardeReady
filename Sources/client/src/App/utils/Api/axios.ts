import axios from "axios";
import { apiUrl } from "../constants";
import { removeCookie } from "../getCookie";

export const instance = axios.create({
    baseURL: apiUrl.base,
    withCredentials: true,
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