import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Reserva } from '@/types';

export function useReservas(filters?: { area?: string; data?: string }) {
  return useQuery({
    queryKey: ['reservas', filters],
    queryFn: async () => {
      const res = await api.get('/reservas', { params: filters || {} });
      return res.data.data as Reserva[];
    },
  });
}

export function useDisponibilidade(area: string, data: string, enabled = false) {
  return useQuery({
    queryKey: ['disponibilidade', area, data],
    queryFn: async () => {
      const res = await api.get('/reservas/disponibilidade', { params: { area, data } });
      return res.data.data.horariosOcupados as { inicio: string; fim: string }[];
    },
    enabled: enabled && !!area && !!data,
  });
}

export function useCreateReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Reserva>) => api.post('/reservas', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservas'] }),
  });
}

export function useCancelarReserva() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.patch(`/reservas/${id}/cancelar`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservas'] }),
  });
}
