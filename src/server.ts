import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
import { seedUsers } from "./database/seed";
import { appDataSource } from "./database/appDataSource";
import { RoundService } from "./services/RoundService";
import { VoteService } from "./services/VoteService";
import { roundRoutes } from "./routes/round.routes";
import { voteRoutes } from "./routes/vote.routes";
import { GoogleSheetsService } from "./services/GoogleSheetsService";
import { WhatsAppBot } from "./bot/whatsapp";

export const botWhatsapp = new WhatsAppBot();


const googleSheetService = new GoogleSheetsService()

dotenv.config();

const PORT = process.env.HOST_APP || 6060;

const app = express();

app.use(express.json());

app.get("/process-votes", async (req, res) => {
  try {
    await googleSheetService.processSheetVotes();
    res.status(200).send("Votos processados e planilha limpa com sucesso!");
  } catch (err: any) {
    console.error(err);
    res.status(500).send(`Erro ao processar votos: ${err.message}`);
  }
});

app.use("/queridometro/v1", roundRoutes, voteRoutes)

appDataSource.initialize()
  .then(async () => {
    console.log("✅ Banco conectado");

    await seedUsers();
    botWhatsapp.initialize();

    app.listen(PORT, () => {
    
      console.log(`
  /$$$$$$                                /$$       /$$                           /$$                        
 /$$__  $$                              |__/      | $$                          | $$                        
| $$  \\ $$ /$$   /$$  /$$$$$$   /$$$$$$  /$$  /$$$$$$$ /$$$$$$/$$$$   /$$$$$$  /$$$$$$    /$$$$$$   /$$$$$$ 
| $$  | $$| $$  | $$ /$$__  $$ /$$__  $$| $$ /$$__  $$| $$_  $$_  $$ /$$__  $$|_  $$_/   /$$__  $$ /$$__  $$
| $$  | $$| $$  | $$| $$$$$$$$| $$  \\__/| $$| $$  | $$| $$ \\ $$ \\ $$| $$$$$$$$  | $$    | $$  \\__/| $$  \\ $$
| $$/$$ $$| $$  | $$| $$_____/| $$      | $$| $$  | $$| $$ | $$ | $$| $$_____/  | $$ /$$| $$      | $$  | $$
|  $$$$$$/|  $$$$$$/|  $$$$$$$| $$      | $$|  $$$$$$$| $$ | $$ | $$|  $$$$$$$  |  $$$$/| $$      |  $$$$$$/
 \\____ $$$ \\______/  \\_______/|__/      |__/ \\_______/|__/ |__/ |__/ \\_______/   \\___/  |__/       \\______/ 
      \\__/                                                                                                  
                                                                                                            
        na porta ${PORT}                                                                                                    
`);

    });
  })
  .catch((error) => console.log(error));
