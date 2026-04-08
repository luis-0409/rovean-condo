interface Morador {
  nome: string;
  telegramId?: string | null;
}

interface Encomenda {
  remetente: string;
  transportadora: string;
  tipo: string;
  tamanho: string;
}

interface Reserva {
  areaComum: string;
  dataReserva: Date;
  horarioInicio: string;
  horarioFim: string;
}

export async function sendMessageRaw(chatId: string, text: string): Promise<void> {
  return sendMessage(chatId, text);
}

async function sendMessage(chatId: string, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  });
}

export async function notificarEncomenda(morador: Morador, encomenda: Encomenda): Promise<void> {
  if (!morador.telegramId) return;
  const text = `📦 *Nova Encomenda!*\nOlá, ${morador.nome}!\nUma encomenda chegou para você.\n📍 Remetente: ${encomenda.remetente}\n🚚 Transportadora: ${encomenda.transportadora}\n📋 Tipo: ${encomenda.tipo} · ${encomenda.tamanho}\nPor favor, retire na portaria.`;
  await sendMessage(morador.telegramId, text);
}

export async function notificarReserva(morador: Morador, reserva: Reserva): Promise<void> {
  if (!morador.telegramId) return;
  const data = new Date(reserva.dataReserva).toLocaleDateString('pt-BR');
  const text = `✅ *Reserva Confirmada!*\nOlá, ${morador.nome}!\nSua reserva foi registrada.\n📍 Área: ${reserva.areaComum}\n📅 Data: ${data}\n🕐 Horário: ${reserva.horarioInicio} às ${reserva.horarioFim}`;
  await sendMessage(morador.telegramId, text);
}
