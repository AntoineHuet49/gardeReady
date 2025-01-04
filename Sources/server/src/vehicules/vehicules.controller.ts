import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { verificationDTO } from 'src/dto/Vehicule.dto';

@Controller('vehicules')
export class VehiculesController {
  constructor(private VehiculesService: VehiculesService) {}

  @Get()
  findAll() {
    return this.VehiculesService.findAll();
  }

  @Get(':id')
  findOneById(@Param('id') id: number) {
    return this.VehiculesService.findOneById(id);
  }

  @Post('verifications/:id')
  verifications(@Param('id') id: number, @Body() body: verificationDTO[]) {
    this.VehiculesService.generatePdf(id, body);
    // return this.VehiculesService.findOneById(id);
  }
}
