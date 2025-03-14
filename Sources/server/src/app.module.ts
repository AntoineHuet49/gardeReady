import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiculesModule } from './vehicules/vehicules.module';
import { ElementsModule } from './elements/elements.module';
import { ConfigModule } from '@nestjs/config';
import { GardesModule } from './gardes/gardes.module';
import { MailerModule } from './Mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './src/.env',
    }),
    // typeorm
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
      retryAttempts: 5, // Nombre de tentatives
      retryDelay: 3000, // Délai entre les tentatives (en ms)
    }),
    // Mailer
    MailerModule,
    // Other
    AuthModule,
    UsersModule,
    VehiculesModule,
    ElementsModule,
    MailerModule,
    GardesModule,
  ],
})
export class AppModule {}
