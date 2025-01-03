import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Vehicules } from './vehicules.entity';

@Entity()
export class Elements {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Vehicules, (vehicules) => vehicules.elements)
  vehicules: Vehicules[];
}
