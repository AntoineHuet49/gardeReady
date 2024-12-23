import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Users } from './users.entity';

@Entity()
export class Gardes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'non assigné' })
  numero: string;

  @Column({ default: 'non assigné' })
  couleur: string;

  @OneToOne(() => Users, (users) => users.garde)
  responsable: Users[];
}
