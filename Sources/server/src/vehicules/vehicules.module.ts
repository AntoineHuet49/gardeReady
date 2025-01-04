import { Module } from '@nestjs/common';
import { VehiculesController } from './vehicules.controller';
import { VehiculesService } from './vehicules.service';
import { Vehicules } from 'src/Entity/vehicules.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Elements } from 'src/Entity/elements.entity';
import { ElementsModule } from 'src/elements/elements.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicules, Elements]), ElementsModule],
  controllers: [VehiculesController],
  providers: [VehiculesService],
})
export class VehiculesModule {}
