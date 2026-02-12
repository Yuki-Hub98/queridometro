import { google } from "googleapis";
import path from "path";
import dotenv from "dotenv";
import { VoteService } from "./VoteService";
import { UserService } from "./UserService";

dotenv.config();

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private voteService = new VoteService();
  private userService = new UserService();

  constructor() {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, "../../queridometro-487202-d3b9fff7412a.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = process.env.PLANILHA_QUERIDOMETRO || "";
  }

  async processSheetVotes(): Promise<void> {
    if (!this.spreadsheetId) throw new Error("Spreadsheet ID não encontrado.");


    const meta = await this.sheets.spreadsheets.get({ spreadsheetId: this.spreadsheetId });
    const firstSheetTitle = meta.data.sheets?.[0]?.properties?.title;
    if (!firstSheetTitle) throw new Error("Nenhuma aba encontrada na planilha");


    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `'${firstSheetTitle}'!A1:Z1000`,
    });

    const values = response.data.values;
    if (!values || values.length < 2) return;

    const header = values[0]; // ["Carimbo de data/hora", "Você", "Yuki", "Symu"]
    const dataRows = values.slice(1);


    const lastResponsesMap: { [key: string]: string[] } = {};
    dataRows.forEach((row: string[]) => {
      if (!row[1]) return; // pula se "Você" estiver vazio
      const timestamp = new Date(row[0]);
      const fromUserName = row[1].charAt(0).toUpperCase() + row[1].slice(1).toLowerCase();
      const key = `${fromUserName}-${timestamp.toDateString()}`;
      lastResponsesMap[key] = row; // sobrescreve se houver mais de uma resposta do mesmo usuário no mesmo dia
    });

    for (const row of Object.values(lastResponsesMap)) {
      const fromUserName = row[1].charAt(0).toUpperCase() + row[1].slice(1).toLowerCase();
      const fromUserId = await this.userService.getUserByName(fromUserName);
      if (!fromUserId) {
        console.log(`Usuário de origem não encontrado: ${fromUserName}`);
        continue;
      }

      for (let col = 2; col < row.length; col++) {
        const emoji = row[col];
        if (!emoji) continue;

        const toUserName = header[col];
        const toUserId = await this.userService.getUserByName(toUserName);
        if (!toUserId) {
          console.log(`Usuário destino não encontrado: ${toUserName}`);
          continue;
        }

        try {
          await this.voteService.vote(fromUserId, toUserId, emoji);
          console.log(`Voto registrado: ${fromUserName} -> ${toUserName} (${emoji})`);
        } catch (err: any) {
          console.log(`Não foi possível registrar voto: ${err.message}`);
        }
      }
    }

      const sheetId = meta.data.sheets?.[0]?.properties?.sheetId;
      if (!sheetId) throw new Error("Não foi possível encontrar o sheetId da aba");

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheetId,   // usa o ID correto
                  dimension: "ROWS",
                  startIndex: 1,      // linha 2 (0-indexed)
                  endIndex: values.length, // até o final das linhas existentes
                },
              },
            },
          ],
        },
      });

  console.log("Linhas de respostas excluídas com sucesso!");

  }
}
