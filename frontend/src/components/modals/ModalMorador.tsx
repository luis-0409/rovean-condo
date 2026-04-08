'use client';
import { Morador } from '@/types';
import StatusBadge from '../shared/StatusBadge';
import { formatDate } from '@/lib/utils';
import { X, Phone, Mail, Car, MapPin, Package, AlertTriangle } from 'lucide-react';

interface Props {
  morador: Morador | null;
  open: boolean;
  onClose: () => void;
}

export default function ModalMorador({ morador, open, onClose }: Props) {
  if (!open || !morador) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '560px', maxHeight: '80vh', overflow: 'auto', zIndex: 1 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', background: 'var(--gold-dim2)', border: '2px solid var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600', color: 'var(--gold)' }}>{morador.iniciais}</span>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600', color: 'var(--text)' }}>{morador.nome}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '500' }}>LOTE {morador.lote}</span>
                <StatusBadge status={morador.ativo ? 'ativo' : 'inativo'} />
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {[
              { icon: Phone, label: 'Telefone', value: morador.telefone },
              { icon: Mail, label: 'Email', value: morador.email },
              { icon: MapPin, label: 'Lote', value: morador.lote },
              { icon: Car, label: 'Veículo', value: morador.veiculo || '—' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <item.icon size={12} color="var(--text-3)" />
                  <span style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {morador.encomendas && morador.encomendas.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <Package size={13} color="var(--text-2)" />
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Encomendas Recentes</span>
              </div>
              {morador.encomendas.slice(0, 5).map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>{e.remetente} · {e.tipo}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{formatDate(e.dataChegada)}</div>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          )}

          {morador.ocorrencias && morador.ocorrencias.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <AlertTriangle size={13} color="var(--text-2)" />
                <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ocorrências</span>
              </div>
              {morador.ocorrencias.slice(0, 5).map(o => (
                <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text)' }}>{o.titulo}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{o.categoria} · {formatDate(o.createdAt)}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
