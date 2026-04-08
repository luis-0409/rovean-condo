import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { acessoSchema } from '../schemas';

const prisma = new PrismaClient();

export async function listar(req: Request, res: Response) {
  const { data } = req.query;
  const where: any = {};
  if (data) {
    const d = new Date(data as string);
    const dFim = new Date(d);
    dFim.setDate(dFim.getDate() + 1);
    where.dataEntrada = { gte: d, lt: dFim };
  }
  const acessos = await prisma.acesso.findMany({ where, include: { morador: true }, orderBy: { dataEntrada: 'desc' } });
  return res.json({ success: true, data: acessos });
}

export async function criar(req: Request, res: Response) {
  const parsed = acessoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Dados inválidos.', errors: parsed.error.errors });
  const acesso = await prisma.acesso.create({ data: parsed.data, include: { morador: true } });
  return res.status(201).json({ success: true, data: acesso });
}

export async function registrarSaida(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const acesso = await prisma.acesso.update({ where: { id }, data: { dataSaida: new Date() }, include: { morador: true } });
  return res.json({ success: true, data: acesso });
}
