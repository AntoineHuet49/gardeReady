import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginReqDTO } from 'src/dto/Login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginReqDTO) {
    return this.authService.login(body);
  }
}
