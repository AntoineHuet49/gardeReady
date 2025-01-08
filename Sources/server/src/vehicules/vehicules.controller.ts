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
  verifications(
    @Param('id') id: number,
    @Body() body: verificationDTO[],
    @Request() req,
  ) {
    const user: payload = req.user;
    return this.VehiculesService.generatePdf(id, body, user);
  }
}
