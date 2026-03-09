import { Message } from "~~/Types/Mailer";
import Mailjet from "node-mailjet";
import { createLogger } from "~~/Utils/Logger";

const logger = createLogger('MailerService');

export class MailerService {
    public static async sendMailAsync(message: Message) {
      try {
        const apiKey = process.env.MAILJET_API_KEY;
        const apiSecret = process.env.MAILJET_API_SECRET;
        const senderEmail = process.env.MAILJET_SENDER_EMAIL;

        if (!apiKey || !apiSecret || !senderEmail) {
          logger.error('Variables MAILJET_API_KEY, MAILJET_API_SECRET ou MAILJET_SENDER_EMAIL manquantes');
          throw new Error('Configuration Mailjet incomplète');
        }

        const mailjet = Mailjet.apiConnect(apiKey, apiSecret);

        logger.debug('Envoi email via Mailjet API', {
          from: senderEmail,
          to: message.to,
          subject: message.subject,
          hasAttachments: !!message.attachments?.length
        });

        logger.info('Tentative d\'envoi email...');

        // Construire le payload Mailjet
        const mailjetMessage: Record<string, any> = {
          From: {
            Email: senderEmail,
            Name: "Veri'Feu",
          },
          To: [
            {
              Email: message.to,
            },
          ],
          Subject: message.subject,
          TextPart: message.text,
        };

        // Ajouter les pièces jointes si présentes
        if (message.attachments && message.attachments.length > 0) {
          mailjetMessage.Attachments = message.attachments.map((att) => ({
            ContentType: att.ContentType,
            Filename: att.Filename,
            Base64Content: att.Base64Content,
          }));
        }

        const result = await mailjet
          .post('send', { version: 'v3.1' })
          .request({
            Messages: [mailjetMessage],
          });

        const responseBody = result.body as any;
        const messageResult = responseBody.Messages?.[0];

        if (messageResult?.Status === 'error') {
          throw new Error(`Mailjet erreur: ${JSON.stringify(messageResult.Errors)}`);
        }

        logger.info('Email envoyé avec succès', {
          messageId: messageResult?.To?.[0]?.MessageID,
          to: message.to,
          status: messageResult?.Status,
        });

        return result;
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