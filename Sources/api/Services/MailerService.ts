import { Message } from "~~/Types/Mailer";
import nodemailer from "nodemailer";
import { createLogger } from "~~/Utils/Logger";

const logger = createLogger('MailerService');

export class MailerService {
    public static async sendMailAsync(message: Message) {
      const gmailUser = process.env.GMAIL_USER;
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

      if (!gmailUser || !gmailAppPassword) {
        logger.error('Variables GMAIL_USER ou GMAIL_APP_PASSWORD manquantes');
        throw new Error('Configuration Gmail incomplète');
      }
  
      // Configuration du transporteur SMTP Gmail
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
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

      // Envoi de l'email
      const info = await transporter.sendMail(mailOptions);

      logger.info('Email envoyé avec succès', {
        messageId: info.messageId,
        to: message.to,
        accepted: info.accepted,
        rejected: info.rejected
      });
  
      return info;
    }
  }