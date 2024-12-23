import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Gardes } from './gardes.entity';
import { Exclude } from 'class-transformer';

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

  @ManyToOne(() => Gardes, (garde) => garde.responsable, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'garde_id' })
  garde: Gardes;
}
