'use client';
import { X, AlertTriangle, Clock } from 'lucide-react';
import { Ocorrencia, StatusOcorrencia } from '@/types';
import StatusBadge from '../shared/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { useUpdateOcorrenciaStatus } from '@/hooks/useOcorrencias';

interface Props { ocorrencia: Ocorrencia | null; open: boolean; onClose: () => void; }

const statusFlow: Record<StatusOcorrencia, StatusOcorrencia | null> = {
  ABERTA: 'EM_ANDAMENTO',
  EM_ANDAMENTO: 'RESOLVIDA',
  RESOLVIDA: null,
};

export default function ModalOcorrencia({ ocorrencia, open, onClose }: Props) {
  const updateStatus = useUpdateOcorrenciaStatus();

  const handleAvancar = async () => {
    if (!ocorrencia) return;
    const next = statusFlow[ocorrencia.status];
    if (!next) return;
    await updateStatus.mutateAsync({ id: ocorrencia.id, status: next });
    onClose();
  };

  if (!open || !ocorrencia) return null;
  const nextStatus = statusFlow[ocorrencia.status];
  const historico = Array.isArray(ocorrencia.historico) ? ocorrencia.historico : [];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '80vh', overflow: 'auto', zIndex: 1 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={18} color="var(--amber)" />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Ocorrência #{ocorrencia.id}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>{ocorrencia.titulo}</h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Morador', value: ocorrencia.morador ? `Lote ${ocorrencia.morador.lote} — ${ocorrencia.morador.nome}` : 'Condomínio' },
              { label: 'Categoria', value: ocorrencia.categoria },
              { label: 'Urgência', value: ocorrencia.urgencia },
              { label: 'Data', value: formatDateTime(ocorrencia.createdAt) },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '6px' }}>Descrição</div>
            <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: '1.5' }}>{ocorrencia.descricao}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>Status atual:</span>
            <StatusBadge status={ocorrencia.status} />
          </div>

          {historico.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Clock size={12} color="var(--text-3)" />
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Histórico</span>
              </div>
              {historico.map((h: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <div style={{ flexShrink: 0, marginTop: '3px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>{h.texto}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>{formatDateTime(h.data)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {nextStatus && (
            <button onClick={handleAvancar} disabled={updateStatus.isPending}
              style={{ width: '100%', background: nextStatus === 'RESOLVIDA' ? 'var(--green)' : 'var(--blue)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              {updateStatus.isPending ? 'Atualizando...' : `Avançar para: ${nextStatus === 'EM_ANDAMENTO' ? 'Em Andamento' : 'Resolvida'}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
