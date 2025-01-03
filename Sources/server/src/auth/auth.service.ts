import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginReqDTO } from 'src/dto/Login.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userServices: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(body: LoginReqDTO) {
    const { email, password } = body;
    const user = await this.userServices.findOneByEmail(email);
    // Check not found && Check password
    if (user === null || password !== user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, username: user.email };
    return await this.jwtService.signAsync(payload);
  }
}
