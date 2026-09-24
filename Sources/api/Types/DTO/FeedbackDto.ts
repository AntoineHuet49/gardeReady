export type FeedbackDto = {
    type: "bug" | "idea";
    message: string;
    page?: string;
    version?: string;
    userAgent?: string;
};
