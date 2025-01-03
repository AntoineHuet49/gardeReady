import { Module } from '@nestjs/common';
import { VehiculesController } from './vehicules.controller';
import { VehiculesService } from './vehicules.service';
import { Vehicules } from 'src/Entity/vehicules.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Elements } from 'src/Entity/elements.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicules, Elements])],
  controllers: [VehiculesController],
  providers: [VehiculesService],
})
export class VehiculesModule {}
