import { WhatsAppBot } from "../bot/whatsapp";
import { Round } from "../entities/Round";
import { User } from "../entities/User";

export async function ClosedRoundMessage(
  bot: WhatsAppBot,
  round: Round,
  allUsers: User[],
  grupoId: string
) {
  let message = "🔒 *Queridometro encerrado!* 🔒\n\n";

  const totalUsers = allUsers.length;
  const requiredVotes = totalUsers - 1;

  const usersDone: string[] = [];
  const usersPending: string[] = [];

  console.log("📑 Analisando votos para cada usuário...");
  allUsers.forEach(user => {
    const votesFromUser = round.votes.filter(
      v => v.fromUser.id === user.id
    );

    if (votesFromUser.length === requiredVotes) {
      usersDone.push(user.name);
    } else {
      usersPending.push(user.name);
    }
  });

  if (usersDone.length) {
    message += "✅ *Completaram a rodada:*\n";
    usersDone.forEach(name => (message += `- ${name}\n`));
    message += "\n";
  }

  if (usersPending.length) {
    message += "⚠️ *Não completaram:*\n";
    usersPending.forEach(name => (message += `- ${name}\n`));
    message += "\n";
  }

  message += "🎭 *Resultados do Queridômetro:*\n\n";

  console.log("📑 Compilando resultados para mensagem...");

  allUsers.forEach(user => {
    const emojisRecebidos = round.votes
      .filter(v => v.toUser?.id === user.id)
      .map(v => v.emoji);

    message += `*${user.name}* → ${emojisRecebidos.length ? emojisRecebidos.join(" ") : "Não recebeu emojis 😶"}\n`;
  });

  message += "\n";

  console.log("📑 Distribuindo estalecas...");

  message += "💰 *Estalecas:*\n";
  allUsers.forEach(user => {
    message += `- ${user.name}: ${user.estalecas} 💸\n`;
  });

  message += "\n🎉 Próxima rodada em breve!";

  try {
    await bot.sendMessage(grupoId, message);
    console.log("✅ Mensagem de fechamento enviada com sucesso!");
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
  }
}
