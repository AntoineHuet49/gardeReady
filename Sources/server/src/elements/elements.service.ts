import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Elements } from 'src/Entity/elements.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ElementsService {
  constructor(
    @InjectRepository(Elements)
    private elementsRepository: Repository<Elements>,
  ) {}

  create(createElementDto: any) {
    console.log(createElementDto);
    return 'This action adds a new element';
  }

  findAll() {
    return `This action returns all elements`;
  }

  findOneById(id: number) {
    return this.elementsRepository.findOne({
      where: { id },
    });
  }

  update(id: number, updateElementDto: any) {
    console.log(updateElementDto);
    return `This action updates a #${id} element`;
  }

  remove(id: number) {
    return `This action removes a #${id} element`;
  }
}
