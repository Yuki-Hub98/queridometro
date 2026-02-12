import { Router } from "express";
import { RoundController } from "../controllers/RoundController";

const roundRoutes = Router();
const roundController = new RoundController();

roundRoutes.post("/round/start", roundController.open);
roundRoutes.post("/round/close", roundController.close);


export { roundRoutes };
