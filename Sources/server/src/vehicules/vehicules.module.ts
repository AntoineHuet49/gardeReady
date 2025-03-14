import { Module } from '@nestjs/common';
import { VehiculesController } from './vehicules.controller';
import { VehiculesService } from './vehicules.service';
import { Vehicules } from 'src/Entity/vehicules.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Elements } from 'src/Entity/elements.entity';
import { ElementsModule } from 'src/elements/elements.module';
import { UsersModule } from 'src/users/users.module';
import { GardesModule } from 'src/gardes/gardes.module';
import { MailerModule } from 'src/Mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicules, Elements]),
    ElementsModule,
    UsersModule,
    GardesModule,
    MailerModule,
  ],
  controllers: [VehiculesController],
  providers: [VehiculesService],
})
export class VehiculesModule {}
