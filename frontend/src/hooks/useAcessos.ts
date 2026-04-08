import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Acesso } from '@/types';

export function useAcessos(data?: string) {
  return useQuery({
    queryKey: ['acessos', data],
    queryFn: async () => {
      const params = data ? { data } : {};
      const res = await api.get('/acessos', { params });
      return res.data.data as Acesso[];
    },
  });
}

export function useCreateAcesso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Acesso>) => api.post('/acessos', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acessos'] }),
  });
}

export function useRegistrarSaida() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.patch(`/acessos/${id}/saida`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['acessos'] }),
  });
}
