import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/Entity/users.entity';
import { Gardes } from 'src/Entity/gardes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Users, Gardes])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
