import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';
import { verificationDTO } from 'src/dto/Vehicule.dto';
import { Vehicules } from 'src/Entity/vehicules.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VehiculesService {
  constructor(
    @InjectRepository(Vehicules)
    private vehiculesRepository: Repository<Vehicules>,
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
    console.log(verification);
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
      body: verification.map((v) => [v.elementId, v.status, v.comment]),
    });

    doc.save(vehicule.name + '.pdf');
  }

  getFormatDate() {
    const date = moment().locale('fr').format('LLL');
    console.log(date);
    return date;
  }
}
