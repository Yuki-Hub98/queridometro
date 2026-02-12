import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

export class WhatsAppBot {
  private client: Client;
  private isReady: boolean = false;

  constructor() {
      this.client = new Client({
      authStrategy: new LocalAuth(),
    });

    this.client.on("qr", (qr) => this.handleQR(qr));
    this.client.on("ready", () => this.handleReady());
    this.client.on("disconnected", (reason) => this.handleDisconnected(reason));
  }

  public initialize() {
    this.client.initialize();
  }

  public async sendMessage(to: string, message: string) {
    if (!this.isReady) {
      throw new Error("WhatsApp ainda não está pronto");
    }

    try {
      await this.client.sendMessage(to, message);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw error;
    }
  }

  private handleQR(qr: string) {
    console.log("Escaneie o QR Code:");
    qrcode.generate(qr, { small: true });
  }

  private handleReady() {
    console.log("✅ WhatsApp conectado!");
    this.isReady = true;
  }

  private handleDisconnected(reason: string) {
    console.log("❌ WhatsApp desconectado:", reason);
    this.isReady = false;
  }

  // Getter para estado
  public get ready() {
    return this.isReady;
  }
}
