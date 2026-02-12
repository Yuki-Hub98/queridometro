import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { Vote } from "./Vote";

export type RoundStatus = "OPEN" | "CLOSED";

@Entity("rounds")
export class Round {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({type: "varchar", default: "OPEN",})
  status: RoundStatus;

  @Column({ default: false })
  isClosing: boolean;

  @OneToMany(() => Vote, (vote) => vote.round)
  votes: Vote[];

  @CreateDateColumn()
  createdAt: Date;


}
