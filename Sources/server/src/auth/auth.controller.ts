import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginReqDTO } from 'src/dto/Login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginReqDTO) {
    console.log(body);
    return this.authService.login(body);
  }
}
