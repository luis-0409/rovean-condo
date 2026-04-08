'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import MetricCard from '@/components/shared/MetricCard';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { Package, CalendarDays, AlertTriangle, Shield } from 'lucide-react';
import { DashboardResumo, Encomenda, Reserva, Ocorrencia } from '@/types';
import { formatDate } from '@/lib/utils';

const areaColors: Record<string, string> = {
  'Churrasqueira': 'var(--amber)',
  'Salão de Festas': 'var(--purple)',
  'Academia': 'var(--blue)',
  'Piscina': 'var(--green)',
  'Quadra': 'var(--red)',
  'Espaço Gourmet': 'var(--gold)',
};

export default function DashboardPage() {
  const { data: resumo } = useQuery<DashboardResumo>({
    queryKey: ['dashboard'],
    queryFn: async () => { const r = await api.get('/dashboard/resumo'); return r.data.data; },
  });

  const { data: encomendas } = useQuery<Encomenda[]>({
    queryKey: ['encomendas', 'PENDENTE'],
    queryFn: async () => { const r = await api.get('/encomendas', { params: { status: 'PENDENTE' } }); return r.data.data; },
  });

  const { data: reservas } = useQuery<Reserva[]>({
    queryKey: ['reservas', {}],
    queryFn: async () => { const r = await api.get('/reservas'); return r.data.data; },
  });

  const { data: ocorrencias } = useQuery<Ocorrencia[]>({
    queryKey: ['ocorrencias', undefined],
    queryFn: async () => { const r = await api.get('/ocorrencias'); return r.data.data; },
  });

  const metrics = [
    { label: 'Encomendas Pendentes', value: resumo?.encomendasPendentes ?? '—', icon: Package, color: 'var(--gold)', bg: 'var(--gold-dim2)', href: '/encomendas' },
    { label: 'Reservas Hoje', value: resumo?.reservasHoje ?? '—', icon: CalendarDays, color: 'var(--blue)', bg: 'var(--blue-bg)', href: '/reservas' },
    { label: 'Ocorrências Abertas', value: resumo?.ocorrenciasAbertas ?? '—', icon: AlertTriangle, color: 'var(--red)', bg: 'var(--red-bg)', href: '/ocorrencias' },
    { label: 'Acessos Hoje', value: resumo?.acessosHoje ?? '—', icon: Shield, color: 'var(--green)', bg: 'var(--green-bg)', href: '/acessos' },
  ];

  const pendentes = encomendas?.filter(e => e.status === 'PENDENTE').slice(0, 5) || [];
  const proximasReservas = reservas?.filter(r => r.status !== 'CANCELADA').slice(0, 3) || [];
  const ocorrenciasAtivas = ocorrencias?.filter(o => o.status !== 'RESOLVIDA').slice(0, 5) || [];

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {metrics.map(m => <MetricCard key={m.label} {...m} />)}
      </div>

      {/* Grid 2 cols */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Encomendas recentes */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>Encomendas Pendentes</h3>
          {pendentes.length === 0 ? (
            <EmptyState icon={Package} title="Nenhuma encomenda pendente" />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {pendentes.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{e.morador?.nome || `Lote ${e.moradorId}`}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{e.remetente} · {e.tipo}</div>
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{formatDate(e.dataChegada)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Próximas reservas */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>Próximas Reservas</h3>
          {proximasReservas.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Nenhuma reserva próxima" />
          ) : (
            proximasReservas.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '3px', height: '32px', borderRadius: '2px', background: areaColors[r.areaComum] || 'var(--gold)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{r.areaComum}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{r.morador?.nome} · {r.horarioInicio}–{r.horarioFim}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '4px' }}>{formatDate(r.dataReserva)}</div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ocorrências ativas */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '16px' }}>Ocorrências em Aberto</h3>
        {ocorrenciasAtivas.length === 0 ? (
          <EmptyState icon={AlertTriangle} title="Nenhuma ocorrência em aberto" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Título', 'Categoria', 'Urgência', 'Data', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 0', textAlign: 'left', fontSize: '11px', color: 'var(--text-3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ocorrenciasAtivas.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 0', fontSize: '13px', color: 'var(--text)' }}>{o.titulo}</td>
                  <td style={{ padding: '10px 0', fontSize: '12px', color: 'var(--text-2)' }}>{o.categoria}</td>
                  <td style={{ padding: '10px 0', fontSize: '12px', color: 'var(--text-2)' }}>{o.urgencia}</td>
                  <td style={{ padding: '10px 0', fontSize: '12px', color: 'var(--text-3)' }}>{formatDate(o.createdAt)}</td>
                  <td style={{ padding: '10px 0' }}><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
