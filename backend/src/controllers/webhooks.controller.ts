import { Request, Response } from 'express';
import { PrismaClient, StatusReserva } from '@prisma/client';
import { notificarEncomenda, sendMessageRaw } from '../services/telegram.service';

const prisma = new PrismaClient();

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function temConflito(i1: string, f1: string, i2: string, f2: string): boolean {
  return horaParaMinutos(i1) < horaParaMinutos(f2) && horaParaMinutos(f1) > horaParaMinutos(i2);
}

export async function notificarEncomendaWebhook(req: Request, res: Response) {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.WEBHOOK_SECRET) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { encomendaId } = req.body;
  const encomenda = await prisma.encomenda.findUnique({ where: { id: encomendaId }, include: { morador: true } });
  if (!encomenda) return res.status(404).json({ success: false, message: 'Encomenda não encontrada.' });

  await notificarEncomenda(encomenda.morador, encomenda);
  await prisma.encomenda.update({ where: { id: encomenda.id }, data: { notificado: true } });
  return res.json({ success: true, message: 'Notificação enviada.' });
}

export async function telegramIdentifica(req: Request, res: Response) {
  const { telegramId } = req.query;
  if (!telegramId) return res.json({ success: false, data: null });

  const morador = await prisma.morador.findFirst({
    where: { telegramId: String(telegramId), ativo: true },
  });

  if (!morador) return res.json({ success: false, data: null });
  return res.json({ success: true, data: morador });
}

export async function reservaBot(req: Request, res: Response) {
  const secret = req.headers['x-webhook-secret'];
  if (secret !== process.env.WEBHOOK_SECRET) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { telegramId, area, data, horarioInicio, horarioFim } = req.body;

  if (!telegramId || !area || !data || !horarioInicio || !horarioFim)
    return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes.' });

  const morador = await prisma.morador.findFirst({ where: { telegramId: String(telegramId), ativo: true } });
  if (!morador) return res.status(404).json({ success: false, message: 'Morador não encontrado.' });

  const dataReserva = new Date(data);
  const dataFim = new Date(dataReserva);
  dataFim.setDate(dataFim.getDate() + 1);

  const existentes = await prisma.reserva.findMany({
    where: { areaComum: area, dataReserva: { gte: dataReserva, lt: dataFim }, status: StatusReserva.CONFIRMADA },
  });

  for (const r of existentes) {
    if (temConflito(horarioInicio, horarioFim, r.horarioInicio, r.horarioFim)) {
      return res.status(409).json({ success: false, message: 'Horário já reservado.' });
    }
  }

  const reserva = await prisma.reserva.create({
    data: {
      moradorId: morador.id,
      areaComum: area,
      dataReserva,
      horarioInicio,
      horarioFim,
      status: StatusReserva.CONFIRMADA,
    },
    include: { morador: true },
  });

  return res.status(201).json({ success: true, data: reserva });
}

export async function disponibilidadeWebhook(req: Request, res: Response) {
  const { area, data } = req.query;
  if (!area || !data) return res.status(400).json({ success: false, message: 'Parâmetros obrigatórios.' });

  const d = new Date(data as string);
  const dFim = new Date(d);
  dFim.setDate(dFim.getDate() + 1);

  const reservas = await prisma.reserva.findMany({
    where: { areaComum: area as string, dataReserva: { gte: d, lt: dFim }, status: { not: 'CANCELADA' } },
  });

  return res.json({ success: true, data: reservas.map(r => ({ inicio: r.horarioInicio, fim: r.horarioFim })) });
}
