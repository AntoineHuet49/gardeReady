import { Message } from "~~/Types/Mailer";
import nodemailer from "nodemailer";
import { createLogger } from "~~/Utils/Logger";

const logger = createLogger('MailerService');

export class MailerService {
    public static async sendMailAsync(message: Message) {
      try {
        const gmailUser = process.env.GMAIL_USER;
        const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

        if (!gmailUser || !gmailAppPassword) {
          logger.error('Variables GMAIL_USER ou GMAIL_APP_PASSWORD manquantes');
          throw new Error('Configuration Gmail incomplète');
        }
    
        // Configuration du transporteur SMTP Gmail avec timeout
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 587,
          secure: false, // true pour port 465, false pour les autres ports
          auth: {
            user: gmailUser,
            pass: gmailAppPassword,
          },
          // Ajouter des timeouts pour éviter les blocages
          connectionTimeout: 20000, // 20 secondes
          greetingTimeout: 10000,    // 10 secondes
          socketTimeout: 20000,      // 20 secondes
        });

        logger.debug('Envoi email via Gmail SMTP', {
          from: gmailUser,
          to: message.to,
          subject: message.subject,
          hasAttachments: !!message.attachments?.length
        });

        // Préparer les options d'envoi
        const mailOptions = {
          from: `"Veri'Feu" <${gmailUser}>`,
          to: message.to,
          subject: message.subject,
          text: message.text,
          attachments: message.attachments?.map((att) => ({
            filename: att.Filename,
            content: att.Base64Content,
            encoding: 'base64',
            contentType: att.ContentType,
          })),
        };

        logger.info('Tentative d\'envoi email...');

        // Envoi de l'email avec timeout global
        const sendPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout: L\'envoi d\'email a pris trop de temps')), 60000); // 60 secondes
        });

        const info = await Promise.race([sendPromise, timeoutPromise]) as any;

        logger.info('Email envoyé avec succès', {
          messageId: info.messageId,
          to: message.to,
          accepted: info.accepted,
          rejected: info.rejected
        });
    
        return info;
      } catch (error: any) {
        logger.error('Erreur lors de l\'envoi de l\'email', {
          error: error.message,
          stack: error.stack,
          to: message.to,
          subject: message.subject
        });
        
        // Propager l'erreur avec plus de contexte
        throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
      }
    }
  }