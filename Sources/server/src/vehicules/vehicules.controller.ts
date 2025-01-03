import { Controller, Get, Param } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';

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
}
