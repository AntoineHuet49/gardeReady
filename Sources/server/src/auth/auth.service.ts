import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginReqDTO } from 'src/dto/Login.dto';
import { Users } from 'src/Entity/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  async login(body: LoginReqDTO) {
    const { email, password } = body;
    const user = await this.usersRepository.find();
    console.log(user);
  }
}
