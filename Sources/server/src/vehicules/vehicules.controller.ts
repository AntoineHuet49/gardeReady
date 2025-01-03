import { Controller, Get } from '@nestjs/common';
import { VehiculesService } from './vehicules.service';

@Controller('vehicules')
export class VehiculesController {
  constructor(private VehiculesService: VehiculesService) {}

  @Get()
  findAll() {
    return this.VehiculesService.findAll();
  }

  @Get(':id')
  findOneById(id: number) {
    return this.VehiculesService.findOneById(id);
  }
}
