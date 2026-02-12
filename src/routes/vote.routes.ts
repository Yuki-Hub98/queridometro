import { Router } from "express";
import { VoteController } from "../controllers/VoteController";

const voteRoutes = Router();
const voteController = new VoteController();

voteRoutes.post("/votes", voteController.create);

export { voteRoutes };
