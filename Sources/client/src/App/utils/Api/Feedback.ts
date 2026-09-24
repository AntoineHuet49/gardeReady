import { apiUrl } from "../constants";
import { instance } from "./axios";

export type FeedbackType = "bug" | "idea";

export function sendFeedback(data: { type: FeedbackType; message: string }) {
    return instance
        .post<{ number: number }>(apiUrl.feedback, {
            ...data,
            page: window.location.pathname,
            version: import.meta.env.VITE_APP_VERSION || "dev",
            userAgent: navigator.userAgent,
        })
        .then((response) => response.data);
}
