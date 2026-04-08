import { Request, Response } from 'express';
import { PrismaClient, StatusReserva } from '@prisma/client';
import { reservaSchema } from '../schemas';

const prisma = new PrismaClient();

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function temConflito(inicio1: string, fim1: string, inicio2: string, fim2: string): boolean {
  const a = horaParaMinutos(inicio1);
  const b = horaParaMinutos(fim1);
  const c = horaParaMinutos(inicio2);
  const d = horaParaMinutos(fim2);
  return a < d && b > c;
}

export async function listar(req: Request, res: Response) {
  const { area, data } = req.query;
  const where: any = {};
  if (area) where.areaComum = area;
  if (data) {
    const d = new Date(data as string);
    const dFim = new Date(d);
    dFim.setDate(dFim.getDate() + 1);
    where.dataReserva = { gte: d, lt: dFim };
  }
  const reservas = await prisma.reserva.findMany({ where, include: { morador: true }, orderBy: { dataReserva: 'asc' } });
  return res.json({ success: true, data: reservas });
}

export async function disponibilidade(req: Request, res: Response) {
  const { area, data } = req.query;
  if (!area || !data) return res.status(400).json({ success: false, message: 'Parâmetros area e data são obrigatórios.' });

  const d = new Date(data as string);
  const dFim = new Date(d);
  dFim.setDate(dFim.getDate() + 1);

  const reservas = await prisma.reserva.findMany({
    where: { areaComum: area as string, dataReserva: { gte: d, lt: dFim }, status: { not: StatusReserva.CANCELADA } },
  });

  const horarios = reservas.map(r => ({ inicio: r.horarioInicio, fim: r.horarioFim }));
  return res.json({ success: true, data: { horariosOcupados: horarios } });
}

export async function criar(req: Request, res: Response) {
  const parsed = reservaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Dados inválidos.', errors: parsed.error.errors });

  const { areaComum, dataReserva, horarioInicio, horarioFim, moradorId, observacoes } = parsed.data;

  const d = new Date(dataReserva);
  const dFim = new Date(d);
  dFim.setDate(dFim.getDate() + 1);

  const existentes = await prisma.reserva.findMany({
    where: { areaComum, dataReserva: { gte: d, lt: dFim }, status: StatusReserva.CONFIRMADA },
  });

  for (const r of existentes) {
    if (temConflito(horarioInicio, horarioFim, r.horarioInicio, r.horarioFim)) {
      return res.status(409).json({ success: false, message: 'Já existe uma reserva confirmada neste horário para esta área.' });
    }
  }

  const reserva = await prisma.reserva.create({
    data: { moradorId, areaComum, dataReserva: d, horarioInicio, horarioFim, observacoes },
    include: { morador: true },
  });
  return res.status(201).json({ success: true, data: reserva });
}

export async function cancelar(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const reserva = await prisma.reserva.update({ where: { id }, data: { status: StatusReserva.CANCELADA }, include: { morador: true } });
  return res.json({ success: true, data: reserva });
}
