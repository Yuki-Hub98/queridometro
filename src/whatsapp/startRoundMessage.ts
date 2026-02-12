import { WhatsAppBot } from "../bot/whatsapp";


export function sedStartRoundMessage() {
  let message = "🔥 *Queridometro da semana!* 🔥\n\n";
  message += "Responda com um emoji para cada pessoa!\n\n";
  message += "Responda aqui: https://forms.gle/mZimGW9wGeESpd6j8";

  return message;
}

export async function StartRoundMessage(bot: WhatsAppBot, chatId: string) {
  const message = sedStartRoundMessage();

  try {
    await bot.sendMessage(chatId, message);
    console.log(`Mensagem enviada para ${chatId}`);
  } catch (err) {
    console.error("Erro ao enviar mensagem do Queridometro:", err);
  }
}
