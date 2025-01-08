import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Gardes } from './gardes.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @ManyToOne(() => Gardes, (gardes) => gardes.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'garde_id' })
  garde: Gardes;
}
