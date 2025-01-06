import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiculesModule } from './vehicules/vehicules.module';
import { ElementsModule } from './elements/elements.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';

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
    MailerModule.forRoot({
      transport: `smtp://${process.env.MAIL_USERNAME}:${process.env.MAIL_PASSWORD}@${process.env.MAIL_SERVER}:${process.env.MAIL_PORT}`,
      defaults: {
        from: `"NoReply-CS-SML" <${process.env.MAIL_USERNAME}>`,
      },
    }),
    // Other
    AuthModule,
    UsersModule,
    VehiculesModule,
    ElementsModule,
    MailerModule,
  ],
})
export class AppModule {}
