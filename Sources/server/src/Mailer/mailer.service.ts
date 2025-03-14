import { Injectable } from '@nestjs/common';
import { Message } from './type';

@Injectable()
export class MailerService {
  async sendMailAsync(message: Message) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Mailjet = require('node-mailjet');

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
