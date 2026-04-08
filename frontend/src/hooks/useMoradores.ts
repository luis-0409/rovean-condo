import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Morador } from '@/types';

export function useMoradores(ativo?: boolean) {
  return useQuery({
    queryKey: ['moradores', ativo],
    queryFn: async () => {
      const params = ativo !== undefined ? { ativo } : {};
      const res = await api.get('/moradores', { params });
      return res.data.data as Morador[];
    },
  });
}

export function useMorador(id: number) {
  return useQuery({
    queryKey: ['moradores', id],
    queryFn: async () => {
      const res = await api.get(`/moradores/${id}`);
      return res.data.data as Morador;
    },
    enabled: !!id,
  });
}

export function useCreateMorador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Morador>) => api.post('/moradores', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moradores'] }),
  });
}

export function useUpdateMorador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Morador> & { id: number }) => api.put(`/moradores/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moradores'] }),
  });
}

export function useDeleteMorador() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/moradores/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moradores'] }),
  });
}
