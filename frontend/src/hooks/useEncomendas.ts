import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Encomenda, StatusEncomenda } from '@/types';

export function useEncomendas(status?: StatusEncomenda) {
  return useQuery({
    queryKey: ['encomendas', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const res = await api.get('/encomendas', { params });
      return res.data.data as Encomenda[];
    },
  });
}

export function useCreateEncomenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Encomenda>) => api.post('/encomendas', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encomendas'] }),
  });
}

export function useRetirarEncomenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.patch(`/encomendas/${id}/retirar`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['encomendas'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useGerarMensagemEncomenda() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await api.get(`/encomendas/${id}/mensagem`);
      return res.data.data as { mensagem: string; temTelegram: boolean };
    },
  });
}

export function useEnviarNotificacaoEncomenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mensagem }: { id: number; mensagem: string }) =>
      api.post(`/encomendas/${id}/notificar`, { mensagem }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['encomendas'] }),
  });
}
