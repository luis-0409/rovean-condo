import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { moradorSchema } from '../schemas';

const prisma = new PrismaClient();

export async function listar(req: Request, res: Response) {
  const ativo = req.query.ativo !== undefined ? req.query.ativo === 'true' : undefined;
  const where = ativo !== undefined ? { ativo } : {};
  const moradores = await prisma.morador.findMany({ where, orderBy: { lote: 'asc' } });
  return res.json({ success: true, data: moradores });
}

export async function obter(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const morador = await prisma.morador.findUnique({
    where: { id },
    include: { encomendas: { orderBy: { createdAt: 'desc' }, take: 10 }, ocorrencias: { orderBy: { createdAt: 'desc' }, take: 10 } },
  });
  if (!morador) return res.status(404).json({ success: false, message: 'Morador não encontrado.' });
  return res.json({ success: true, data: morador });
}

export async function criar(req: Request, res: Response) {
  const parsed = moradorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Dados inválidos.', errors: parsed.error.errors });
  const morador = await prisma.morador.create({ data: parsed.data });
  return res.status(201).json({ success: true, data: morador });
}

export async function editar(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const parsed = moradorSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Dados inválidos.' });
  const morador = await prisma.morador.update({ where: { id }, data: parsed.data });
  return res.json({ success: true, data: morador });
}

export async function remover(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  await prisma.morador.update({ where: { id }, data: { ativo: false } });
  return res.json({ success: true, message: 'Morador desativado com sucesso.' });
}
