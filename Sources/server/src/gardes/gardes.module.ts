import { Module } from '@nestjs/common';
import { GardesService } from './gardes.service';
import { GardesController } from './gardes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gardes } from 'src/Entity/gardes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gardes])],
  controllers: [GardesController],
  providers: [GardesService],
  exports: [GardesService],
})
export class GardesModule {}
