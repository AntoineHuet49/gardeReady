import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import * as fs from "fs";
import { TVehicules } from "~~/Models/Vehicules";
import { ElementsRepository } from "~~/Repositories/ElementsRepository";
import VehiculesRepository from "~~/Repositories/VehiculesRepository";
import { verificationDTO } from "~~/Types/DTO/VerificationDto";
import { TUserPayload } from "~~/Types/User";
import { GardesRepository } from "~~/Repositories/GardeRepository";
import { Attachments, Message } from "~~/Types/Mailer";
import * as path from "path";
import { MailerService } from "./MailerService";
import { createLogger } from "~~/Utils/Logger";

const logger = createLogger("VehiculesService");

export default class VehiculesService {
    public static getAllVehicules() {
        return VehiculesRepository.getAllVehicules();
    }

    public static async getOneById(id: number) {
        const vehicule = await VehiculesRepository.getOneByIdWithSections(id);
        return vehicule?.toJSON();
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
    ) {
        // Créer le dossier public s'il n'existe pas
        const publicDir = path.dirname(filePath);
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
            logger.info(`Dossier créé: ${publicDir}`);
        }

        logger.debug(`Génération du PDF pour le véhicule ${vehicule.name} par ${user.firstname} ${user.lastname}`);

        const doc = new jsPDF();
        doc.text("Date : " + this.getFormatDate(), 10, 10);
        doc.text("Garde : " + user.garde_id, 10, 20);
        doc.text(`Agent : ${user.firstname} ${user.lastname}`, 10, 30);
        doc.text("Véhicule : " + vehicule.name, 10, 40);

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
            body: await Promise.all(
                Object.keys(verification).map(async (key) => {
                    const elementId = parseInt(key);
                    const element = await ElementsRepository.getOneById(
                        verification[elementId].elementId
                    );
                    return [
                        element?.name ?? "",
                        verification[elementId].status ?? "",
                        verification[elementId].comment ?? "",
                    ];
                })
            ),
        });

        const pdfBuffer = doc.output("arraybuffer");
        fs.writeFileSync(filePath, Buffer.from(pdfBuffer));
        logger.info(`PDF généré avec succès: ${filePath}`);
    }

    public static async sendVerificationMail(
        userPayload: TUserPayload,
        vehicule: TVehicules,
        filePath: string
    ) {
        logger.debug(`Préparation de l'envoi d'email pour le véhicule ${vehicule.name}`);
        
        const responsable = await GardesRepository.getResponsable(
            userPayload.garde_id
        );
        const recipient = responsable?.email;
        
        if (!recipient) {
            logger.warn(`Aucun responsable trouvé pour la garde ${userPayload.garde_id}`);
            throw new Error("Aucun responsable de garde trouvé");
        }
        
        logger.debug(`Email sera envoyé à: ${recipient}`);
        
        const message: Message = {
            to: recipient,
            subject: "Véhicule : " + vehicule.name,
            text: "Véhicule : " + vehicule.name,
        };

        const attachments: Attachments[] = [
            {
                ContentType: "application/pdf",
                Filename: vehicule.name + ".pdf",
                Base64Content: fs.readFileSync(filePath, "base64"),
            },
        ];

        message.attachments = attachments;

        const result = await MailerService.sendMailAsync(message);
        logger.success(`Email de vérification envoyé avec succès à ${recipient} pour le véhicule ${vehicule.name}`);

        return result;
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

    private static getFormatDate() {
        return moment().locale("fr").format("LLL");
    }
}
