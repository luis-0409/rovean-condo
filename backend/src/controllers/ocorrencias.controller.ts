import { Request, Response } from 'express';
import { PrismaClient, StatusOcorrencia } from '@prisma/client';
import { ocorrenciaSchema, ocorrenciaStatusSchema } from '../schemas';

const prisma = new PrismaClient();

export async function listar(req: Request, res: Response) {
  const status = req.query.status as StatusOcorrencia | undefined;
  const where = status ? { status } : {};
  const ocorrencias = await prisma.ocorrencia.findMany({ where, include: { morador: true }, orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: ocorrencias });
}

export async function criar(req: Request, res: Response) {
  const parsed = ocorrenciaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Dados inválidos.', errors: parsed.error.errors });
  const ocorrencia = await prisma.ocorrencia.create({
    data: { ...parsed.data, historico: JSON.stringify([{ data: new Date().toISOString(), texto: 'Ocorrência registrada.' }]) },
    include: { morador: true },
  });
  return res.status(201).json({ success: true, data: ocorrencia });
}

export async function atualizarStatus(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const parsed = ocorrenciaStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Status inválido.' });

  const atual = await prisma.ocorrencia.findUnique({ where: { id } });
  if (!atual) return res.status(404).json({ success: false, message: 'Ocorrência não encontrada.' });

  const historico = Array.isArray(atual.historico) ? atual.historico as any[] : JSON.parse(atual.historico as string);
  const statusLabels: Record<string, string> = { ABERTA: 'Aberta', EM_ANDAMENTO: 'Em Andamento', RESOLVIDA: 'Resolvida' };
  historico.push({ data: new Date().toISOString(), texto: `Status atualizado para: ${statusLabels[parsed.data.status]}` });

  const ocorrencia = await prisma.ocorrencia.update({
    where: { id },
    data: { status: parsed.data.status, historico: JSON.stringify(historico) },
    include: { morador: true },
  });
  return res.json({ success: true, data: ocorrencia });
}
