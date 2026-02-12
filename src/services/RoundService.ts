import { appDataSource } from "../database/appDataSource";
import { Round } from "../entities/Round";
import { User } from "../entities/User";
import { Vote } from "../entities/Vote";
import { StartRoundMessage } from "../whatsapp/startRoundMessage";
import { WhatsAppBot } from "../bot/whatsapp";
import dotenv from "dotenv";
import { ClosedRoundMessage } from "../whatsapp/closedRoundMessage";
import { GoogleSheetsService } from "./GoogleSheetsService";
dotenv.config();

export class RoundService {
  private roundRepository = appDataSource.getRepository(Round);
  private userRepository = appDataSource.getRepository(User);
  private voteRepository = appDataSource.getRepository(Vote);
  private googleSheetService = new GoogleSheetsService();

  async startRound( botWhatsapp: WhatsAppBot) {

    const existingRound = await this.roundRepository.findOne({
      where: { status: "OPEN" },
    });

    if (existingRound) {
      throw new Error("Já existe uma rodada aberta.");
    }

    const round = this.roundRepository.create({
      status: "OPEN",
    });

    await this.roundRepository.save(round);

    await StartRoundMessage(botWhatsapp, process.env.GRUPO_WHATSAPP!);

    return round;
  }

  async closeRound(botWhatsapp: WhatsAppBot) {
    //Busca a rodada aberta
    const round = await this.roundRepository.findOne({
      where: { status: "OPEN", isClosing: false },
      relations: ["votes", "votes.fromUser", "votes.toUser"],
    });

    if (!round) {
      throw new Error("Nenhuma rodada aberta ou já está sendo fechada.");
    }

    // Marca que a rodada está em fechamento
    round.isClosing = true;
    await this.roundRepository.save(round);

    try {
      // Processa votos da planilha
      await this.googleSheetService.processSheetVotes();

      const updatedRound = await this.roundRepository.findOne({
        where: { id: round.id },
        relations: ["votes", "votes.fromUser", "votes.toUser"],
      });

      if (!updatedRound) throw new Error("Erro ao recarregar a rodada após processar votos.");

      //Atualiza estalecas dos usuários
      const users = await this.userRepository.find();
      const totalUsers = users.length;
      const requiredVotes = totalUsers - 1;

      for (const user of users) {
        const votesFromUser = updatedRound.votes.filter(v => v.fromUser.id === user.id);

        if (votesFromUser.length === requiredVotes) {
          user.estalecas += 5;
        } else {
          user.estalecas -= 10;
        }

        await this.userRepository.save(user);
      }

      //Finaliza a rodada
      updatedRound.status = "CLOSED";
      updatedRound.isClosing = false;
      await this.roundRepository.save(updatedRound);

      // Envia mensagem de fechamento no WhatsApp
      await ClosedRoundMessage(botWhatsapp, updatedRound, users, process.env.GRUPO_WHATSAPP!);

      return updatedRound;

    } catch (err) {
      // Em caso de erro, limpa a flag para que a rodada não fique travada
      console.error("Erro ao fechar rodada:", err);
      round.isClosing = false;
      await this.roundRepository.save(round);
      throw err;
    }
  }


  async hasClosingRound() {
    return this.roundRepository.findOne({
      where: { status: "OPEN" },
    });
  }

}
