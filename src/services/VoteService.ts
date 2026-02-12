import { appDataSource } from "../database/appDataSource";
import { Vote } from "../entities/Vote";
import { User } from "../entities/User";
import { Round } from "../entities/Round";

export class VoteService {
  private voteRepository = appDataSource.getRepository(Vote);
  private userRepository = appDataSource.getRepository(User);
  private roundRepository = appDataSource.getRepository(Round);

  async vote(fromUserId: number, toUserId: number, emoji: string) {
    
    const openRound = await this.roundRepository.findOne({
      where: { status: "OPEN" },
    });

    if (!openRound) {
      throw new Error("Não existe rodada aberta.");
    }

    const fromUser = await this.userRepository.findOne({
      where: { id: fromUserId },
    });

    const toUser = await this.userRepository.findOne({
      where: { id: toUserId },
    });

    if (!fromUser || !toUser) {
      throw new Error("Usuário não encontrado.");
    }

    if (fromUser.id === toUser.id) {
      throw new Error("Você não pode votar em si mesmo.");
    }

    const existingVote = await this.voteRepository.findOne({
      where: {
        round: { id: openRound.id },
        fromUser: { id: fromUser.id },
        toUser: { id: toUser.id },
      },
      relations: ["round", "fromUser", "toUser"],
    });

    if (existingVote) {
      throw new Error("Você já votou nessa pessoa nessa rodada.");
    }

    const vote = this.voteRepository.create({
      round: openRound,
      fromUser,
      toUser,
      emoji,
    });

    await this.voteRepository.save(vote);

    return vote;
  }
}
