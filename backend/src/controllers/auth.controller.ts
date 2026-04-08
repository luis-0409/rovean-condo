import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema } from '../schemas';

const prisma = new PrismaClient();

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'Dados inválidos.', errors: parsed.error.errors });

  const { email, senha } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.ativo) return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });

  const valid = await bcrypt.compare(senha, user.senha);
  if (!valid) return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });

  const token = jwt.sign(
    { id: user.id, email: user.email, perfil: user.perfil, nome: user.nome },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
  );

  return res.json({ success: true, data: { token, user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil } } });
}
