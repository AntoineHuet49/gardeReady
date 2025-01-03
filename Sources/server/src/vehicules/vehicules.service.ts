import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vehicules } from 'src/Entity/vehicules.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VehiculesService {
  constructor(
    @InjectRepository(Vehicules)
    private vehiculesRepository: Repository<Vehicules>,
  ) {}

  async findAll() {
    return await this.vehiculesRepository.find();
  }

  async findOneById(id: number) {
    return await this.vehiculesRepository.findOne({
      where: { id },
      relations: ['elements'],
    });
  }
}
