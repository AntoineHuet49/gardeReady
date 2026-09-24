import { OperationResult } from "~~/Helpers/OperationResult";
import { FeedbackDto } from "~~/Types/DTO/FeedbackDto";
import { TUserPayload } from "~~/Types/User";
import { createLogger } from "~~/Utils/Logger";

const logger = createLogger('FeedbackService');

export class FeedbackService {
    /**
     * Crée une issue GitHub à partir d'un retour utilisateur.
     * Le dépôt est public : on n'y écrit jamais le nom ni l'email de l'utilisateur, seulement son id.
     */
    public static async createIssue(dto: FeedbackDto, user: TUserPayload): Promise<OperationResult<{ number: number }>> {
        const token = process.env.GITHUB_TOKEN;
        const repo = process.env.GITHUB_REPO;
        if (!token || !repo) {
            logger.error("GITHUB_TOKEN ou GITHUB_REPO non configuré");
            return OperationResult.fail("Le service de retour n'est pas configuré");
        }

        const isBug = dto.type === "bug";
        const firstLine = dto.message.trim().split("\n")[0];
        const summary = firstLine.length > 70 ? `${firstLine.slice(0, 70)}…` : firstLine;
        const body = [
            dto.message.trim(),
            "",
            "---",
            `- Utilisateur : #${user.id} (${user.role})`,
            `- Page : ${dto.page ?? "inconnue"}`,
            `- Version : ${dto.version ?? "inconnue"}`,
            `- Navigateur : ${dto.userAgent ?? "inconnu"}`,
            "",
            "_Envoyé depuis l'application._",
        ].join("\n");

        const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            body: JSON.stringify({
                title: `[${isBug ? "Bug" : "Idée"}] ${summary}`,
                body,
                labels: [isBug ? "bug" : "enhancement"],
            }),
        });

        if (!response.ok) {
            logger.error(`Création d'issue GitHub échouée (${response.status}): ${await response.text()}`);
            return OperationResult.fail("Impossible d'envoyer le retour pour le moment");
        }

        const issue = await response.json();
        logger.info(`Issue GitHub #${issue.number} créée par l'utilisateur #${user.id}`);
        return OperationResult.ok({ number: issue.number });
    }
}
