import { Module } from '@nestjs/common';
import { ElementsService } from './elements.service';
import { ElementsController } from './elements.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicules } from 'src/Entity/vehicules.entity';
import { Elements } from 'src/Entity/elements.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicules, Elements])],
  controllers: [ElementsController],
  providers: [ElementsService],
  exports: [ElementsService],
})
export class ElementsModule {}
