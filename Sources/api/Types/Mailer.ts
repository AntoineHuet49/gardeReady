export type Message = {
    to: string;
    subject: string;
    text: string;
    attachments?: Attachments[];
};

export type Attachments = {
    ContentType: string;
    Filename: string;
    Base64Content: string;
};
