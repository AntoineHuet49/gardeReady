import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity('gardes')
export class Gardes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  number: string;

  @Column({ type: 'varchar', length: 50 })
  color: string;

  @ManyToOne(() => Users, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'responsable' }) // Utilisation explicite de la colonne responsable
  responsable: Users;

  @OneToMany(() => Users, (user) => user.garde)
  users: Users[];
}
