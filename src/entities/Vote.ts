import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from "typeorm";
import { User } from "./User";
import { Round } from "./Round";

@Entity("votes")
@Unique(["round", "fromUser", "toUser"]) 
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Round, (round) => round.votes, { onDelete: "CASCADE" })
  round: Round;

  @ManyToOne(() => User, (user) => user.votesSent)
  fromUser: User;

  @ManyToOne(() => User, (user) => user.votesReceived)
  toUser: User;

  @Column()
  emoji: string;

  @CreateDateColumn()
  createdAt: Date;
}
