import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Users } from './users.entity';

@Entity()
export class Gardes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'non assigné' })
  numero: string;

  @OneToOne(() => Users, (responsable) => responsable.garde_id)
  responsable: Users;
}
