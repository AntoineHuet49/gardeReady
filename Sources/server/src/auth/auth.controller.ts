import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginReqDTO } from 'src/dto/Login.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @HttpCode(401)
  async login(
    @Body() body: LoginReqDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.authService.login(body);
    response.cookie('token', token, {
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60 * 1000, // 1h
    });
    return token;
  }
}
