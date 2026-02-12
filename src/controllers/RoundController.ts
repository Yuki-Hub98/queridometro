import { Request, Response } from "express";
import { RoundService } from "../services/RoundService";
import { botWhatsapp } from "../server";

export class RoundController {
  async open(req: Request, res: Response) {
    try {
      const roundService = new RoundService();
      const round = await roundService.startRound(botWhatsapp);

      return res.json({
        message: "Rodada aberta com sucesso ✅",
        round,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

  async close(req: Request, res: Response) {
    try {
      const roundService = new RoundService();
      const round = await roundService.closeRound(botWhatsapp);

      return res.json({
        message: "Rodada encerrada com sucesso 🔒",
        round,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message,
      });
    }
  }

}


