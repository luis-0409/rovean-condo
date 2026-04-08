import { Request, Response } from 'express';
import { PrismaClient, StatusEncomenda, StatusOcorrencia } from '@prisma/client';

const prisma = new PrismaClient();

export async function resumo(req: Request, res: Response) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const amanha = new Date(hoje);
  amanha.setDate(amanha.getDate() + 1);

  const [encomendasPendentes, reservasHoje, ocorrenciasAbertas, acessosHoje] = await Promise.all([
    prisma.encomenda.count({ where: { status: StatusEncomenda.PENDENTE } }),
    prisma.reserva.count({ where: { dataReserva: { gte: hoje, lt: amanha } } }),
    prisma.ocorrencia.count({ where: { status: { in: [StatusOcorrencia.ABERTA, StatusOcorrencia.EM_ANDAMENTO] } } }),
    prisma.acesso.count({ where: { dataEntrada: { gte: hoje, lt: amanha } } }),
  ]);

  return res.json({ success: true, data: { encomendasPendentes, reservasHoje, ocorrenciasAbertas, acessosHoje } });
}
