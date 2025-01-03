import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Elements } from './elements.entity';

@Entity()
export class Vehicules {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Elements, (elements) => elements.vehicules)
  @JoinTable({
    name: 'vehicules_elements',
    joinColumn: {
      name: 'vehicule_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'element_id',
      referencedColumnName: 'id',
    },
  })
  elements: Elements[];
}
