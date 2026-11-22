import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import * as fs from "fs";
import { TVehicules } from "~~/Models/Vehicules";
import { ElementsRepository } from "~~/Repositories/ElementsRepository";
import VehiculesRepository from "~~/Repositories/VehiculesRepository";
import { verificationDTO } from "~~/Types/DTO/VerificationDto";
import { TUserPayload } from "~~/Types/User";
import { VerificationsRepository } from "~~/Repositories/VerificationsRepository";
import { GardesRepository } from "~~/Repositories/GardeRepository";
import { Attachments, Message } from "~~/Types/Mailer";
import * as path from "path";
import { MailerService } from "./MailerService";
import { createLogger } from "~~/Utils/Logger";

const logger = createLogger("VehiculesService");
/**
 * Sanitise le nom de fichier pour éviter les problèmes avec les serveurs mail
 * Supprime les accents, espaces et caractères spéciaux
 */
function sanitizeFilename(filename: string): string {
    return filename
        .normalize('NFD') // Normaliser les caractères Unicode
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Remplacer caractères spéciaux par _
        .replace(/_{2,}/g, '_') // Éviter les underscores multiples
        .replace(/^_|_$/g, ''); // Retirer les underscores en début/fin
}
export default class VehiculesService {
    public static getAllVehicules() {
        return VehiculesRepository.getAllVehicules();
    }

    public static async getOneById(id: number) {
        return VehiculesRepository.getOneByIdWithSections(id);
    }

    public static async createVehicule(name: string) {
        try {
            if (!name || name.trim() === "") {
                throw new Error("Le nom du véhicule est requis");
            }

            const vehicule = await VehiculesRepository.createVehicule({ name });
            return vehicule;
        } catch (error) {
            console.error("Erreur lors de la création du véhicule:", error);
            throw error;
        }
    }

    public static async updateVehicule(id: number, name: string) {
        if (!name || name.trim() === "") {
            throw new Error("Le nom du véhicule est requis");
        }
        const vehicule = await VehiculesRepository.updateVehicule(id, { name: name.trim() });
        if (!vehicule) {
            throw new Error("Véhicule non trouvé");
        }
        return vehicule;
    }

    public static async deleteVehicule(id: number) {
        try {
            const result = await VehiculesRepository.deleteVehicule(id);
            if (!result) {
                throw new Error("Véhicule non trouvé");
            }
            return result;
        } catch (error) {
            console.error("Erreur lors de la suppression du véhicule:", error);
            throw error;
        }
    }

    public static async generatePdf(
        vehicule: TVehicules,
        verification: verificationDTO[],
        filePath: string,
        user: TUserPayload
    ): Promise<string[][]> {
        // Créer le dossier public s'il n'existe pas
        const publicDir = path.dirname(filePath);
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
            logger.info(`Dossier créé: ${publicDir}`);
        }

        logger.debug(`Génération du PDF pour le véhicule ${vehicule.name} par ${user.firstname} ${user.lastname}`);

        const rows = await Promise.all(
            Object.keys(verification).map(async (key) => {
                const elementId = parseInt(key);
                const element = await ElementsRepository.getOneById(
                    verification[elementId].elementId
                );
                return [
                    element ? `${element.quantite} ${element.name}` : "",
                    verification[elementId].status ?? "",
                    verification[elementId].comment ?? "",
                ];
            })
        );

        const pdfBuffer = this.renderPdf(
            { date: this.getFormatDate(), garde: user.garde_id, agent: `${user.firstname} ${user.lastname}`, vehicule: vehicule.name },
            rows
        );
        fs.writeFileSync(filePath, Buffer.from(pdfBuffer));
        logger.info(`PDF généré avec succès: ${filePath}`);
        return rows;
    }

    /** Met en page le rapport ; sert à la génération initiale comme au téléchargement depuis l'historique. */
    public static renderPdf(
        info: { date: string; garde: number | null | undefined; agent: string; vehicule: string },
        rows: string[][]
    ): ArrayBuffer {
        const doc = new jsPDF();
        doc.text("Date : " + info.date, 10, 10);
        doc.text("Garde : " + info.garde, 10, 20);
        doc.text(`Agent : ${info.agent}`, 10, 30);
        doc.text("Véhicule : " + info.vehicule, 10, 40);

        autoTable(doc, {
            margin: { top: 60 },
            columns: ["Element", "Statut", "Commentaire"],
            columnStyles: {
                1: { halign: "center", cellWidth: 20 },
            },
            didParseCell: (data) => {
                if (data.column.index === 1) {
                    if (data.cell.raw === "OK") {
                        data.cell.styles.fillColor = [0, 255, 0];
                    }
                    if (data.cell.raw === "KO") {
                        data.cell.styles.fillColor = [255, 0, 0];
                    }
                }
            },
            body: rows,
        });

        return doc.output("arraybuffer");
    }

    /** Historique : conserve un instantané des lignes du rapport (renommer/supprimer un élément ne le modifie pas). */
    public static saveVerification(vehicule: TVehicules, rows: string[][], user: TUserPayload) {
        return VerificationsRepository.Create({
            vehicule_id: vehicule.id,
            user_id: user.id,
            garde_id: user.garde_id ?? null,
            results: rows.map(([element, status, comment]) => ({ element, status, comment })),
        });
    }

    /** undefined = toutes les gardes (superAdmin) ; sinon les gardes dont l'utilisateur est responsable, plus la sienne s'il est admin. */
    private static async visibleGardeIds(user: TUserPayload) {
        if (user.role === "superAdmin") return undefined;
        const gardeIds = await VerificationsRepository.GardeIdsOfResponsable(user.id);
        if (user.role === "admin" && user.garde_id) gardeIds.push(user.garde_id);
        return gardeIds;
    }

    public static async getHistory(user: TUserPayload) {
        return VerificationsRepository.GetAll(await this.visibleGardeIds(user));
    }

    public static getMine(user: TUserPayload) {
        return VerificationsRepository.GetAll(undefined, user.id);
    }

    public static setMailSent(id: number, sent: boolean) {
        return VerificationsRepository.SetMailSent(id, sent);
    }

    /** PDF régénéré depuis l'instantané ; null si introuvable ou non autorisé (auteur, ou ceux qui voient l'historique). */
    public static async getVerificationPdf(id: number, user: TUserPayload) {
        const v = await VerificationsRepository.GetOne(id);
        if (!v) return null;
        if (v.user_id !== user.id) {
            const gardeIds = await this.visibleGardeIds(user);
            if (gardeIds && !(v.garde_id && gardeIds.includes(v.garde_id))) return null;
        }
        const pdf = this.renderPdf(
            {
                date: this.getFormatDate(v.created_at),
                garde: v.garde_id,
                agent: `${v.user.firstname} ${v.user.lastname}`,
                vehicule: v.vehicule.name,
            },
            v.results.map((r) => [r.element, r.status, r.comment])
        );
        return { pdf: Buffer.from(pdf), filename: `Verif_${sanitizeFilename(v.vehicule.name)}_${moment(v.created_at).format("YYYYMMDD")}.pdf` };
    }

    public static async sendVerificationMail(
        userPayload: TUserPayload,
        vehicule: TVehicules,
        filePath: string
    ) {
        try {
            logger.debug(`Préparation de l'envoi d'email pour le véhicule ${vehicule.name}`);

            if (!userPayload.garde_id) {
                throw new Error("Aucune garde assignée à cet utilisateur");
            }

            const responsable = await GardesRepository.getResponsable(
                userPayload.garde_id
            );
            const recipient = responsable?.email;
            
            if (!recipient) {
                logger.warn(`Aucun responsable trouvé pour la garde ${userPayload.garde_id}`);
                throw new Error("Aucun responsable de garde trouvé");
            }
            
            logger.debug(`Email sera envoyé à: ${recipient}`);
            
            // Générer un nom de fichier sécurisé
            const dateStr = moment().format('YYYYMMDD');
            const cleanVehiculeName = sanitizeFilename(vehicule.name);
            const sanitizedFilename = `Verif_${cleanVehiculeName}_${dateStr}.pdf`;
            
            // Lire le PDF et calculer sa taille
            const pdfBase64 = fs.readFileSync(filePath, "base64");
            const pdfSizeKB = (Buffer.from(pdfBase64, 'base64').length / 1024).toFixed(2);
            
            logger.info('Préparation de l\'email', {
                vehicule: vehicule.name,
                filename: sanitizedFilename,
                taillePDF: `${pdfSizeKB} KB`,
                destinataire: recipient
            });
            
            const dateFormatted = VehiculesService.getFormatDate();
            
            const message: Message = {
                to: recipient,
                subject: `Rapport de vérification - ${vehicule.name}`,
                text: `Rapport de vérification\n\nVéhicule : ${vehicule.name}\nDate : ${dateFormatted}\n\nVeuillez trouver ci-joint le rapport de vérification.\n\nCordialement,\nL'équipe GardeReady`,
            };

            const attachments: Attachments[] = [
                {
                    ContentType: "application/pdf",
                    Filename: sanitizedFilename,
                    Base64Content: pdfBase64,
                },
            ];

            message.attachments = attachments;

            logger.info('Appel du service d\'envoi d\'email...');
            const result = await MailerService.sendMailAsync(message);
            logger.success(`Email de vérification envoyé avec succès à ${recipient} pour le véhicule ${vehicule.name}`);

            return result;
        } catch (error: any) {
            logger.error('Erreur lors de l\'envoi de l\'email de vérification', {
                vehicule: vehicule.name,
                garde: userPayload.garde_id,
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Échec de l'envoi du rapport de vérification: ${error.message}`);
        }
    }

    public static removePdf(filePath: string) {
        // Vérifier si le fichier existe avant de le supprimer
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                logger.debug(`Fichier PDF temporaire supprimé: ${filePath}`);
            } catch (error) {
                logger.error(`Erreur lors de la suppression du fichier ${filePath}`, error);
            }
        }
    }

    public static getFormatDate(date: Date = new Date()) {
        return moment(date).locale("fr").format("LLL");
    }
}
