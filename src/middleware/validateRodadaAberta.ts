import { NextFunction, Request, Response } from "express";
import { RoundService } from "../services/RoundService";

export const validateRodadaAberta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roundService = new RoundService();
    const existingRound = await roundService.hasClosingRound();

    if (existingRound?.isClosing) {
      return res
        .status(400)
        .json({ error: "Rodada em andamento (contagem de votos)." });
    }

    next();

  } catch (err) {
    next(err);
  }
};
