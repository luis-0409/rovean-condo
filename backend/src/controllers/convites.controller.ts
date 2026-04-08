import { Request, Response } from 'express';
import { PrismaClient, StatusConvite } from '@prisma/client';

const prisma = new PrismaClient();

export async function validarConvite(req: Request, res: Response) {
  const { codigo } = req.body;
  if (!codigo) return res.status(400).json({ success: false, message: 'Código obrigatório.' });

  const convite = await prisma.conviteVisitante.findUnique({
    where: { codigo },
    include: { morador: { select: { nome: true, lote: true } } },
  });

  if (!convite) {
    return res.status(404).json({ success: false, message: 'QR Code não encontrado.' });
  }

  if (convite.status === StatusConvite.USADO) {
    return res.status(409).json({ success: false, message: 'Este QR Code já foi utilizado.' });
  }

  if (convite.status === StatusConvite.EXPIRADO || convite.validade < new Date()) {
    await prisma.conviteVisitante.update({ where: { id: convite.id }, data: { status: StatusConvite.EXPIRADO } });
    return res.status(410).json({ success: false, message: 'Este QR Code está expirado.' });
  }

  // Marca como usado e registra acesso
  await prisma.$transaction([
    prisma.conviteVisitante.update({
      where: { id: convite.id },
      data: { status: StatusConvite.USADO, usadoEm: new Date() },
    }),
    prisma.acesso.create({
      data: {
        moradorId: convite.moradorId,
        nomeVisitante: convite.nomeVisitante,
        lote: convite.lote,
        tipo: 'QR Code Visitante',
        status: 'autorizado',
        motivoVisita: `QR Code gerado via Telegram — válido até ${convite.validade.toLocaleDateString('pt-BR')}`,
      },
    }),
  ]);

  return res.json({
    success: true,
    message: `Acesso autorizado para ${convite.nomeVisitante}.`,
    visitante: convite.nomeVisitante,
    morador: convite.morador.nome,
    lote: convite.lote,
  });
}

export async function listarConvites(req: Request, res: Response) {
  const convites = await prisma.conviteVisitante.findMany({
    include: { morador: { select: { nome: true, lote: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return res.json(convites);
}
