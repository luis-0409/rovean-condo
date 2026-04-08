import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6),
});

export const moradorSchema = z.object({
  lote: z.string().min(1),
  nome: z.string().min(2),
  telefone: z.string().min(8),
  email: z.string().email(),
  veiculo: z.string().optional(),
  iniciais: z.string().min(1).max(3),
  telegramId: z.string().optional(),
});

export const encomendaSchema = z.object({
  moradorId: z.number().int().positive(),
  remetente: z.string().min(1),
  transportadora: z.string().min(1),
  tipo: z.string().min(1),
  tamanho: z.string().min(1),
});

export const reservaSchema = z.object({
  moradorId: z.number().int().positive(),
  areaComum: z.string().min(1),
  dataReserva: z.string(),
  horarioInicio: z.string(),
  horarioFim: z.string(),
  observacoes: z.string().optional(),
});

export const ocorrenciaSchema = z.object({
  moradorId: z.number().int().positive().optional(),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  categoria: z.string().min(1),
  urgencia: z.string().min(1),
});

export const acessoSchema = z.object({
  moradorId: z.number().int().positive().optional(),
  nomeVisitante: z.string().min(1),
  lote: z.string().min(1),
  tipo: z.string().min(1),
  status: z.string().min(1),
  motivoVisita: z.string().optional(),
});

export const ocorrenciaStatusSchema = z.object({
  status: z.enum(['ABERTA', 'EM_ANDAMENTO', 'RESOLVIDA']),
});
