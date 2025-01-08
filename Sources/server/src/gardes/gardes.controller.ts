import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GardesService } from './gardes.service';

@Controller('gardes')
export class GardesController {
  constructor(private readonly gardesService: GardesService) {}

  @Post()
  create(@Body() createGardeDto: any) {
    return this.gardesService.create(createGardeDto);
  }

  @Get()
  findAll() {
    return this.gardesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gardesService.findOneById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGardeDto: any) {
    return this.gardesService.update(+id, updateGardeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gardesService.remove(+id);
  }
}
