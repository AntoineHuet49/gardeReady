import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VehiculesService } from './vehicules.service';
import { verificationDTO } from 'src/dto/Vehicule.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { payload } from 'src/auth/type';
import * as path from 'path';

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

  @UseGuards(AuthGuard)
  @Post('verifications/:id')
  async verifications(
    @Param('id') id: number,
    @Body() body: verificationDTO[],
    @Request() req,
  ) {
    const userPayload: payload = req.user;
    const filePath = path.join(process.cwd(), '/public/verification.pdf');
    const vehicule = await this.findOneById(id);

    this.VehiculesService.generatePdf(vehicule, body, filePath, userPayload);
    this.VehiculesService.sendVerificationMail(userPayload, vehicule);
    this.VehiculesService.removePdf(filePath);
  }
}
