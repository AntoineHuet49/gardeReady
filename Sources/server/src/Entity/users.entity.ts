import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Gardes } from './gardes.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  firstname: string;

  @Column({ nullable: true })
  lastname: string;

  @OneToMany(() => Gardes, (gardes) => gardes.id)
  garde_id: Gardes;
}
