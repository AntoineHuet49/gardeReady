import { Message } from "~~/Types/Mailer";
import Mailjet from "node-mailjet";

export class MailerService {
    public static async sendMailAsync(message: Message) {
      const mailJetApiKey = process.env.MJ_APIKEY_PUBLIC;
      const mailJetSecretKey = process.env.MJ_APIKEY_PRIVATE;
  
      const mailjet = new Mailjet({
        apiKey: mailJetApiKey,
        apiSecret: mailJetSecretKey,
      });
  
      const response = await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'antoine.huet.webdev@gmail.com',
              Name: 'CS-SML',
            },
            To: [
              {
                Email: message.to,
              },
            ],
            Subject: message.subject,
            TextPart: message.text,
            Attachments: message.attachments,
          },
        ],
      });
  
      return response;
    }
  }