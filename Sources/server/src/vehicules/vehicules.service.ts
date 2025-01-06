import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';
import * as path from 'path';
import * as fs from 'fs';
import { verificationDTO } from 'src/dto/Vehicule.dto';
import { ElementsService } from 'src/elements/elements.service';
import { Vehicules } from 'src/Entity/vehicules.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class VehiculesService {
  constructor(
    @InjectRepository(Vehicules)
    private vehiculesRepository: Repository<Vehicules>,
    private elementsService: ElementsService,
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

  async generatePdf(id: number, verification: verificationDTO[]) {
    const vehicule = await this.findOneById(id);
    const doc = new jsPDF();
    doc.text('Date : ' + this.getFormatDate(), 10, 10);
    doc.text('Véhicule : ', 10, 20);
    doc.text('\u2022 ' + vehicule.name, 20, 30);

    autoTable(doc, {
      margin: { top: 40 },
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
        verification.map(async (v) => {
          const element = await this.elementsService.findOneById(v.elementId);
          return [element.name, v.status, v.comment];
        }),
      ),
    });

    const filePath = path.join(process.cwd(), '/public/verification.pdf');
    const pdfBuffer = doc.output('arraybuffer');
    fs.writeFileSync(filePath, Buffer.from(pdfBuffer));

    this.mailerService.sendMail({
      to: 'antoine.200@orange.fr',
      subject: 'Véhicule : ' + vehicule.name,
      text: 'Véhicule : ' + vehicule.name,
      attachments: [{ path: filePath }],
    });
  }

  getFormatDate() {
    const date = moment().locale('fr').format('LLL');
    console.log(date);
    return date;
  }
}
