import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Ocorrencia, StatusOcorrencia } from '@/types';

export function useOcorrencias(status?: StatusOcorrencia) {
  return useQuery({
    queryKey: ['ocorrencias', status],
    queryFn: async () => {
      const params = status ? { status } : {};
      const res = await api.get('/ocorrencias', { params });
      return res.data.data as Ocorrencia[];
    },
  });
}

export function useCreateOcorrencia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Ocorrencia>) => api.post('/ocorrencias', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ocorrencias'] }),
  });
}

export function useUpdateOcorrenciaStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: StatusOcorrencia }) => api.patch(`/ocorrencias/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ocorrencias'] }),
  });
}
