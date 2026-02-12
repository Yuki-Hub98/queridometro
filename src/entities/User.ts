import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Vote } from "./Vote";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  phone?: string;

  @Column({ unique: true })
  aniversario?: string;

  @Column({ default: 0 })
  estalecas: number;

  @OneToMany(() => Vote, (vote) => vote.fromUser)
  votesSent: Vote[];

  @OneToMany(() => Vote, (vote) => vote.toUser)
  votesReceived: Vote[];

  @CreateDateColumn()
  createdAt: Date;
}
