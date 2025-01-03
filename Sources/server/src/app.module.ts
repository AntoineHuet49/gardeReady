import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiculesModule } from './vehicules/vehicules.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'database',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_DATABASE || 'gardeready',
      autoLoadEntities: true,
      synchronize: false,
      retryAttempts: 5, // Nombre de tentatives
      retryDelay: 3000, // Délai entre les tentatives (en ms)
    }),
    AuthModule,
    UsersModule,
    VehiculesModule,
  ],
})
export class AppModule {}
