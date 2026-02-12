import { Request, Response } from "express";
import { VoteService } from "../services/VoteService";

export class VoteController {
  async create(req: Request, res: Response) {
    try {
      const { fromUserId, toUserId, emoji } = req.body;

      const voteService = new VoteService();

      const vote = await voteService.vote(
        fromUserId,
        toUserId,
        emoji
      );

      return res.json({
        message: "Voto registrado com sucesso ✅",
        vote,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }
}
