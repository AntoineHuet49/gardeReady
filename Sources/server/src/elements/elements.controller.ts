import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ElementsService } from './elements.service';

@Controller('elements')
export class ElementsController {
  constructor(private readonly elementsService: ElementsService) {}

  @Post()
  create(@Body() createElementDto: any) {
    return this.elementsService.create(createElementDto);
  }

  @Get()
  findAll() {
    return this.elementsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.elementsService.findOneById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateElementDto: any) {
    return this.elementsService.update(+id, updateElementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.elementsService.remove(+id);
  }
}
