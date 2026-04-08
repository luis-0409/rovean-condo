import { Request, Response } from 'express';
import { PrismaClient, StatusEncomenda } from '@prisma/client';
import { encomendaSchema } from '../schemas';
import { notificarEncomenda, sendMessageRaw } from '../services/telegram.service';
import { gerarMensagemEncomenda } from '../services/groq.service';

const prisma = new PrismaClient();

export async function listar(req: Request, res: Response) {
  const status = req.query.status as StatusEncomenda | undefined;
  const where = status ? { status } : {};
  const encomendas = await prisma.encomenda.findMany({ where, include: { morador: true }, orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: encomendas });
}

export async function obter(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const encomenda = await prisma.encomenda.findUnique({ where: { id }, include: { morador: true } });
  if (!encomenda) return res.status(404).json({ success: false, message: 'Encomenda não encontrada.' });
  return res.json({ success: true, data: encomenda });
}

export async function criar(req: Request, res: Response) {
  const parsed = encomendaSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Dados inválidos.', errors: parsed.error.errors });

  const encomenda = await prisma.encomenda.create({ data: parsed.data, include: { morador: true } });

  if (encomenda.morador.telegramId) {
    await notificarEncomenda(encomenda.morador, encomenda).catch(console.error);
    await prisma.encomenda.update({ where: { id: encomenda.id }, data: { notificado: true } });
  }

  return res.status(201).json({ success: true, data: encomenda });
}

export async function retirar(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const encomenda = await prisma.encomenda.update({
    where: { id },
    data: { status: StatusEncomenda.RETIRADA, dataRetirada: new Date() },
    include: { morador: true },
  });
  return res.json({ success: true, data: encomenda });
}

export async function gerarMensagem(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const encomenda = await prisma.encomenda.findUnique({ where: { id }, include: { morador: true } });
  if (!encomenda) return res.status(404).json({ success: false, message: 'Encomenda não encontrada.' });

  const mensagem = await gerarMensagemEncomenda({
    moradorNome: encomenda.morador.nome,
    remetente: encomenda.remetente,
    transportadora: encomenda.transportadora,
    tipo: encomenda.tipo,
    tamanho: encomenda.tamanho,
  });

  return res.json({ success: true, data: { mensagem, temTelegram: !!encomenda.morador.telegramId } });
}

export async function enviarNotificacao(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  const { mensagem } = req.body as { mensagem: string };

  if (!mensagem?.trim()) return res.status(400).json({ success: false, message: 'Mensagem não pode ser vazia.' });

  const encomenda = await prisma.encomenda.findUnique({ where: { id }, include: { morador: true } });
  if (!encomenda) return res.status(404).json({ success: false, message: 'Encomenda não encontrada.' });
  if (!encomenda.morador.telegramId) return res.status(400).json({ success: false, message: 'Morador não possui Telegram cadastrado.' });

  await sendMessageRaw(encomenda.morador.telegramId, mensagem);
  await prisma.encomenda.update({ where: { id }, data: { notificado: true } });

  return res.json({ success: true, data: { enviado: true } });
}
