import { PrismaClient, StatusReserva } from '@prisma/client';
import { sendMessageRaw, sendMessageWithKeyboard, answerCallbackQuery } from './telegram.service';

const prisma = new PrismaClient();

type Estado =
  | 'IDLE'
  | 'RESERVA_AREA'
  | 'RESERVA_DATA'
  | 'RESERVA_INICIO'
  | 'RESERVA_FIM'
  | 'VISITANTE_NOME'
  | 'ENTREGADOR_NOME';

interface Sessao {
  estado: Estado;
  moradorId: number;
  moradorLote: string;
  area?: string;
  data?: string;
  inicio?: string;
}

const sessoes = new Map<string, Sessao>();

const MENU_PRINCIPAL = {
  inline_keyboard: [
    [{ text: '📅 Fazer Reserva', callback_data: 'menu_reserva' }],
    [{ text: '📦 Minhas Encomendas', callback_data: 'menu_encomendas' }],
    [{ text: '🚪 Liberar Visitante', callback_data: 'menu_visitante' }],
    [{ text: '🛵 Liberar Entregador', callback_data: 'menu_entregador' }],
  ],
};

const MENU_AREAS = {
  inline_keyboard: [
    [{ text: '🔥 Churrasqueira', callback_data: 'area_Churrasqueira' }],
    [{ text: '🎉 Salão de Festas', callback_data: 'area_Salão de Festas' }],
    [{ text: '💪 Academia', callback_data: 'area_Academia' }],
    [{ text: '🏊 Piscina', callback_data: 'area_Piscina' }],
    [{ text: '↩️ Voltar', callback_data: 'menu_voltar' }],
  ],
};

function parsearData(texto: string): string | null {
  const match = texto.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/);
  if (match) {
    const dia = match[1].padStart(2, '0');
    const mes = match[2].padStart(2, '0');
    const ano = match[3] || new Date().getFullYear().toString();
    return `${ano}-${mes}-${dia}`;
  }
  if (/amanh/i.test(texto)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (/hoje/i.test(texto)) return new Date().toISOString().split('T')[0];
  return null;
}

function parsearHora(texto: string): string | null {
  const match = texto.match(/(\d{1,2})(?:[h:](\d{2})?)?/);
  if (!match) return null;
  const hora = match[1].padStart(2, '0');
  const min = (match[2] || '00').padStart(2, '0');
  return `${hora}:${min}`;
}

function formatarData(data: string): string {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function horaParaMin(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export async function processarUpdate(
  chatId: string,
  texto?: string,
  callbackData?: string,
  callbackQueryId?: string
): Promise<void> {
  const morador = await prisma.morador.findFirst({
    where: { telegramId: chatId, ativo: true },
  });

  if (!morador) {
    await sendMessageRaw(chatId, '❌ Seu número não está cadastrado no sistema.\n\nEntre em contato com a administração.');
    return;
  }

  if (!sessoes.has(chatId)) {
    sessoes.set(chatId, { estado: 'IDLE', moradorId: morador.id, moradorLote: morador.lote });
  }
  const sessao = sessoes.get(chatId)!;
  sessao.moradorId = morador.id;
  sessao.moradorLote = morador.lote;

  const nome = morador.nome.split(' ')[0];

  if (callbackQueryId) await answerCallbackQuery(callbackQueryId);

  // — Callbacks —
  if (callbackData) {
    if (callbackData === 'menu_voltar' || callbackData === 'menu_cancelar') {
      sessao.estado = 'IDLE';
      await sendMessageWithKeyboard(chatId, `Menu principal, ${nome}:`, MENU_PRINCIPAL);
      return;
    }

    if (callbackData === 'menu_reserva') {
      sessao.estado = 'RESERVA_AREA';
      await sendMessageWithKeyboard(chatId, '📍 Qual área você deseja reservar?', MENU_AREAS);
      return;
    }

    if (callbackData === 'menu_encomendas') {
      const encomendas = await prisma.encomenda.findMany({
        where: { moradorId: morador.id, status: 'PENDENTE' },
        orderBy: { dataChegada: 'desc' },
      });
      if (encomendas.length === 0) {
        await sendMessageWithKeyboard(chatId, '📦 Você não tem encomendas pendentes no momento.', MENU_PRINCIPAL);
      } else {
        const lista = encomendas.map((e, i) =>
          `*${i + 1}.* ${e.remetente} — ${e.tipo} (${e.tamanho})\n📅 ${new Date(e.dataChegada).toLocaleDateString('pt-BR')}`
        ).join('\n\n');
        await sendMessageWithKeyboard(chatId, `📦 *Encomendas pendentes:*\n\n${lista}\n\nPor favor, retire na portaria.`, MENU_PRINCIPAL);
      }
      return;
    }

    if (callbackData === 'menu_visitante') {
      sessao.estado = 'VISITANTE_NOME';
      await sendMessageRaw(chatId, '🚪 Qual o nome do visitante?\n\n_Digite o nome completo:_');
      return;
    }

    if (callbackData === 'menu_entregador') {
      sessao.estado = 'ENTREGADOR_NOME';
      await sendMessageRaw(chatId, '🛵 Qual o nome do entregador?\n\n_Digite o nome completo:_');
      return;
    }

    if (callbackData.startsWith('area_')) {
      sessao.area = callbackData.replace('area_', '');
      sessao.estado = 'RESERVA_DATA';
      await sendMessageRaw(chatId, `📍 *${sessao.area}* selecionada!\n\n📅 Para qual data?\n_ex: 20/04 ou "amanhã"_`);
      return;
    }
  }

  // — Mensagens de texto —
  if (texto) {
    if (sessao.estado === 'IDLE') {
      await sendMessageWithKeyboard(chatId, `Olá, ${nome}! 👋 O que você deseja fazer?`, MENU_PRINCIPAL);
      return;
    }

    if (sessao.estado === 'RESERVA_AREA') {
      await sendMessageWithKeyboard(chatId, 'Por favor, escolha uma área clicando nos botões abaixo:', MENU_AREAS);
      return;
    }

    if (sessao.estado === 'RESERVA_DATA') {
      const data = parsearData(texto);
      if (!data) {
        await sendMessageRaw(chatId, '⚠️ Não entendi a data. Use o formato DD/MM _(ex: 20/04)_ ou escreva _"amanhã"_.');
        return;
      }
      const hoje = new Date().toISOString().split('T')[0];
      if (data < hoje) {
        await sendMessageRaw(chatId, '⚠️ Essa data já passou. Por favor informe uma data futura.');
        return;
      }
      sessao.data = data;
      sessao.estado = 'RESERVA_INICIO';
      await sendMessageRaw(chatId, `📅 *${formatarData(data)}* anotado!\n\n🕐 Qual o horário de início?\n_ex: 14:00 ou 14h_`);
      return;
    }

    if (sessao.estado === 'RESERVA_INICIO') {
      const inicio = parsearHora(texto);
      if (!inicio) {
        await sendMessageRaw(chatId, '⚠️ Não entendi o horário. Use o formato HH:MM _(ex: 14:00)_ ou _14h_.');
        return;
      }
      sessao.inicio = inicio;
      sessao.estado = 'RESERVA_FIM';
      await sendMessageRaw(chatId, `🕐 Início às *${inicio}*\n\n🕕 Qual o horário de término?`);
      return;
    }

    if (sessao.estado === 'RESERVA_FIM') {
      const fim = parsearHora(texto);
      if (!fim) {
        await sendMessageRaw(chatId, '⚠️ Não entendi o horário. Use o formato HH:MM _(ex: 18:00)_ ou _18h_.');
        return;
      }
      if (horaParaMin(fim) <= horaParaMin(sessao.inicio!)) {
        await sendMessageRaw(chatId, `⚠️ O término deve ser depois do início _(${sessao.inicio})_. Tente novamente.`);
        return;
      }

      const d = new Date(sessao.data! + 'T12:00:00');
      const dFim = new Date(d);
      dFim.setDate(dFim.getDate() + 1);

      const existentes = await prisma.reserva.findMany({
        where: { areaComum: sessao.area!, dataReserva: { gte: d, lt: dFim }, status: { not: 'CANCELADA' } },
      });

      const conflito = existentes.find(r =>
        horaParaMin(sessao.inicio!) < horaParaMin(r.horarioFim) &&
        horaParaMin(fim) > horaParaMin(r.horarioInicio)
      );

      if (conflito) {
        const ocupados = existentes.map(r => `• ${r.horarioInicio} às ${r.horarioFim}`).join('\n');
        sessao.estado = 'RESERVA_INICIO';
        await sendMessageRaw(chatId, `❌ *Horário ocupado!*\n\nHorários reservados em ${formatarData(sessao.data!)}:\n${ocupados}\n\nQual outro horário de início?`);
        return;
      }

      await prisma.reserva.create({
        data: {
          moradorId: morador.id,
          areaComum: sessao.area!,
          dataReserva: d,
          horarioInicio: sessao.inicio!,
          horarioFim: fim,
          status: StatusReserva.CONFIRMADA,
        },
      });

      sessao.estado = 'IDLE';
      await sendMessageWithKeyboard(
        chatId,
        `✅ *Reserva Confirmada!*\n\n📍 Área: ${sessao.area}\n📅 Data: ${formatarData(sessao.data!)}\n🕐 Horário: ${sessao.inicio} às ${fim}\n\nQuer fazer mais alguma coisa?`,
        MENU_PRINCIPAL
      );
      return;
    }

    if (sessao.estado === 'VISITANTE_NOME') {
      await prisma.acesso.create({
        data: {
          moradorId: morador.id,
          nomeVisitante: texto,
          lote: morador.lote,
          tipo: 'Manual',
          status: 'autorizado',
          motivoVisita: 'Autorizado via Telegram',
        },
      });
      sessao.estado = 'IDLE';
      await sendMessageWithKeyboard(
        chatId,
        `✅ *Visitante autorizado!*\n\n👤 ${texto}\n🏠 Lote ${morador.lote}\n\nQuer fazer mais alguma coisa?`,
        MENU_PRINCIPAL
      );
      return;
    }

    if (sessao.estado === 'ENTREGADOR_NOME') {
      await prisma.acesso.create({
        data: {
          moradorId: morador.id,
          nomeVisitante: texto,
          lote: morador.lote,
          tipo: 'Manual',
          status: 'autorizado',
          motivoVisita: 'Entregador autorizado via Telegram',
        },
      });
      sessao.estado = 'IDLE';
      await sendMessageWithKeyboard(
        chatId,
        `✅ *Entregador autorizado!*\n\n🛵 ${texto}\n🏠 Lote ${morador.lote}\n\nQuer fazer mais alguma coisa?`,
        MENU_PRINCIPAL
      );
      return;
    }
  }
}
