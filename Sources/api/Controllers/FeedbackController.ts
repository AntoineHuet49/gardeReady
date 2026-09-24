import { Request, Response } from "express";
import { FeedbackService } from "~~/Services/FeedbackService";
import { FeedbackDto } from "~~/Types/DTO/FeedbackDto";

const MAX_MESSAGE_LENGTH = 5000;

export class FeedbackController {
    public static createFeedback = async (req: Request, res: Response) => {
        const dto: FeedbackDto = req.body;

        if (dto.type !== "bug" && dto.type !== "idea") {
            res.status(400).json({ message: "Le type doit être « bug » ou « idea »" });
            return;
        }

        if (typeof dto.message !== "string" || dto.message.trim().length < 5) {
            res.status(400).json({ message: "Merci de décrire votre retour en quelques mots" });
            return;
        }

        if (dto.message.length > MAX_MESSAGE_LENGTH) {
            res.status(400).json({ message: `Le message ne doit pas dépasser ${MAX_MESSAGE_LENGTH} caractères` });
            return;
        }

        const result = await FeedbackService.createIssue(
            {
                type: dto.type,
                message: dto.message,
                page: typeof dto.page === "string" ? dto.page.slice(0, 200) : undefined,
                version: typeof dto.version === "string" ? dto.version.slice(0, 50) : undefined,
                userAgent: typeof dto.userAgent === "string" ? dto.userAgent.slice(0, 300) : undefined,
            },
            req.user!
        );

        if (!result.success) {
            res.status(502).json({ message: result.message });
            return;
        }

        res.status(201).json(result.data);
    };
}
