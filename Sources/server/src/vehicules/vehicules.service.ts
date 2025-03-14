import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';
import * as fs from 'fs';
import { verificationDTO } from 'src/dto/Vehicule.dto';
import { ElementsService } from 'src/elements/elements.service';
import { Vehicules } from 'src/Entity/vehicules.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { payload } from 'src/auth/type';
import { GardesService } from 'src/gardes/gardes.service';
import { MailerService } from 'src/Mailer/mailer.service';
import { Attachments, Message } from 'src/Mailer/type';
import * as path from 'path';

@Injectable()
export class VehiculesService {
  constructor(
    @InjectRepository(Vehicules)
    private vehiculesRepository: Repository<Vehicules>,
    private elementsService: ElementsService,
    private usersService: UsersService,
    private gardeService: GardesService,
    private readonly mailerService: MailerService,
  ) {}

  async findAll() {
    return await this.vehiculesRepository.find();
  }

  async findOneById(id: number) {
    return await this.vehiculesRepository.findOne({
      where: { id },
      relations: ['elements'],
    });
  }

  async generatePdf(
    vehicule: Vehicules,
    verification: verificationDTO[],
    filePath: string,
    userPayload: payload,
  ) {
    const user = await this.usersService.findOneByEmail(userPayload.username);

    const doc = new jsPDF();
    doc.text('Date : ' + this.getFormatDate(), 10, 10);
    doc.text('Garde : ' + user.garde.number, 10, 20);
    doc.text(`Agent : ${user.firstname} ${user.lastname}`, 10, 30);
    doc.text('Véhicule : ', 10, 40);
    doc.text('\u2022 ' + vehicule.name, 20, 50);

    autoTable(doc, {
      margin: { top: 60 },
      columns: ['Element', 'Statut', 'Commentaire'],
      columnStyles: {
        1: { halign: 'center', cellWidth: 20 },
      },
      didParseCell: (data) => {
        if (data.column.index === 1) {
          if (data.cell.raw === 'OK') {
            data.cell.styles.fillColor = [0, 255, 0];
          }
          if (data.cell.raw === 'KO') {
            data.cell.styles.fillColor = [255, 0, 0];
          }
        }
      },
      body: await Promise.all(
        Object.keys(verification).map(async (key) => {
          const element = await this.elementsService.findOneById(
            verification[key].elementId,
          );
          return [
            element.name,
            verification[key].status,
            verification[key].comment,
          ];
        }),
      ),
    });

    const pdfBuffer = doc.output('arraybuffer');
    fs.writeFileSync(filePath, Buffer.from(pdfBuffer));
  }

  removePdf(filePath: string) {
    fs.unlinkSync(filePath);
  }

  async sendVerificationMail(userPayload: payload, vehicule: Vehicules) {
    const garde = (await this.usersService.findOneByEmail(userPayload.username))
      .garde;
    const responsable = (await this.gardeService.findOneById(garde.id))
      .responsable;
    const recipient = responsable.email;
    const message: Message = {
      to: recipient,
      subject: 'Véhicule : ' + vehicule.name,
      text: 'Véhicule : ' + vehicule.name,
    };

    const attachments: Attachments[] = [
      {
        ContentType: 'application/pdf',
        Filename: vehicule.name + '.pdf',
        Base64Content: fs.readFileSync(
          path.join(process.cwd(), '/public/verification.pdf'),
          'base64',
        ),
      },
    ];

    message.attachments = attachments;

    const result = await this.mailerService.sendMailAsync(message);

    return result;
  }

  getFormatDate() {
    return moment().locale('fr').format('LLL');
  }
}
