export type Perfil = 'ADMIN' | 'PORTEIRO';
export type StatusEncomenda = 'PENDENTE' | 'RETIRADA';
export type StatusReserva = 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA';
export type StatusOcorrencia = 'ABERTA' | 'EM_ANDAMENTO' | 'RESOLVIDA';

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface Morador {
  id: number;
  lote: string;
  nome: string;
  telefone: string;
  email: string;
  veiculo?: string;
  iniciais: string;
  telegramId?: string;
  ativo: boolean;
  createdAt: string;
  encomendas?: Encomenda[];
  ocorrencias?: Ocorrencia[];
}

export interface Encomenda {
  id: number;
  moradorId: number;
  morador?: Morador;
  remetente: string;
  transportadora: string;
  tipo: string;
  tamanho: string;
  status: StatusEncomenda;
  notificado: boolean;
  dataChegada: string;
  dataRetirada?: string;
  createdAt: string;
}

export interface Reserva {
  id: number;
  moradorId: number;
  morador?: Morador;
  areaComum: string;
  dataReserva: string;
  horarioInicio: string;
  horarioFim: string;
  status: StatusReserva;
  observacoes?: string;
  createdAt: string;
}

export interface HistoricoItem {
  data: string;
  texto: string;
}

export interface Ocorrencia {
  id: number;
  moradorId?: number;
  morador?: Morador;
  titulo: string;
  descricao: string;
  categoria: string;
  urgencia: string;
  status: StatusOcorrencia;
  historico: HistoricoItem[];
  createdAt: string;
}

export interface Acesso {
  id: number;
  moradorId?: number;
  morador?: Morador;
  nomeVisitante: string;
  lote: string;
  tipo: string;
  status: string;
  motivoVisita?: string;
  dataEntrada: string;
  dataSaida?: string;
}

export interface DashboardResumo {
  encomendasPendentes: number;
  reservasHoje: number;
  ocorrenciasAbertas: number;
  acessosHoje: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
