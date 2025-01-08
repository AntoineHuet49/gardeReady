import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Gardes } from 'src/Entity/gardes.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GardesService {
  constructor(
    @InjectRepository(Gardes)
    private gardesRepository: Repository<Gardes>,
  ) {}

  create(createGardeDto: any) {
    console.log(createGardeDto);
    return 'This action adds a new garde';
  }

  findAll() {
    return `This action returns all gardes`;
  }

  async findOneById(id: number) {
    return await this.gardesRepository.findOne({
      where: { id },
      relations: ['responsable'],
    });
  }

  update(id: number, updateGardeDto: any) {
    console.log(updateGardeDto);
    return `This action updates a #${id} garde`;
  }

  remove(id: number) {
    return `This action removes a #${id} garde`;
  }
}
