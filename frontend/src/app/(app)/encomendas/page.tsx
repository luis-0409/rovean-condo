'use client';
import { useState } from 'react';
import { useEncomendas, useCreateEncomenda } from '@/hooks/useEncomendas';
import { useMoradores } from '@/hooks/useMoradores';
import { Encomenda, StatusEncomenda } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import ModalEncomenda from '@/components/modals/ModalEncomenda';
import EmptyState from '@/components/shared/EmptyState';
import { Package, Plus, X } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

type Filter = 'TODAS' | StatusEncomenda;

const inputStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border-2)',
  borderRadius: '8px',
  padding: '9px 12px',
  color: 'var(--text)',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
} as React.CSSProperties;

export default function EncomendasPage() {
  const [filter, setFilter] = useState<Filter>('TODAS');
  const [selected, setSelected] = useState<Encomenda | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState('');

  const statusFilter = filter === 'TODAS' ? undefined : filter as StatusEncomenda;
  const { data: encomendas, isLoading } = useEncomendas(statusFilter);
  const { data: moradores } = useMoradores(true);
  const criar = useCreateEncomenda();

  const [form, setForm] = useState({
    moradorId: '', remetente: '', transportadora: '', tipo: 'Caixa', tamanho: 'Médio',
  });

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      await criar.mutateAsync({ ...form, moradorId: parseInt(form.moradorId) } as any);
      setCreateOpen(false);
      setForm({ moradorId: '', remetente: '', transportadora: '', tipo: 'Caixa', tamanho: 'Médio' });
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Erro ao registrar encomenda.');
    }
  };

  const filters: { key: Filter; label: string }[] = [
    { key: 'TODAS', label: 'Todas' },
    { key: 'PENDENTE', label: 'Pendentes' },
    { key: 'RETIRADA', label: 'Retiradas' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: 'var(--text)' }}>Encomendas</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '3px' }}>
            {encomendas?.filter(e => e.status === 'PENDENTE').length || 0} pendentes de retirada
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={15} /> Nova Encomenda
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.15s',
              background: filter === f.key ? 'var(--gold-dim2)' : 'var(--surface)',
              color: filter === f.key ? 'var(--gold)' : 'var(--text-2)',
              border: filter === f.key ? '1px solid var(--gold)' : '1px solid var(--border)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>Carregando...</div>
        ) : !encomendas || encomendas.length === 0 ? (
          <EmptyState icon={Package} title="Nenhuma encomenda encontrada" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Destinatário', 'Remetente', 'Transportadora', 'Tipo', 'Chegada', 'Status'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {encomendas.map(e => (
                <tr key={e.id}
                  onClick={() => { setSelected(e); setModalOpen(true); }}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={el => (el.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-2)'}
                  onMouseLeave={el => (el.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{e.morador?.nome || `Morador ${e.moradorId}`}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Lote {e.morador?.lote}</div>
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--text-2)' }}>{e.remetente}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--text-2)' }}>{e.transportadora}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--text-2)' }}>{e.tipo} · {e.tamanho}</td>
                  <td style={{ padding: '13px 16px', fontSize: '12px', color: 'var(--text-3)' }}>{formatDateTime(e.dataChegada)}</td>
                  <td style={{ padding: '13px 16px' }}><StatusBadge status={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal detalhe */}
      <ModalEncomenda encomenda={selected} open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Modal criar */}
      {createOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setCreateOpen(false)} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '460px', zIndex: 1 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Package size={18} color="var(--gold)" />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Registrar Encomenda</h3>
              </div>
              <button onClick={() => setCreateOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: '24px' }}>
              {createError && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: '8px', padding: '10px', marginBottom: '14px', color: 'var(--red)', fontSize: '12px' }}>{createError}</div>}

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Destinatário</label>
                <select value={form.moradorId} onChange={e => upd('moradorId', e.target.value)} required
                  style={{ ...inputStyle }}>
                  <option value="">Selecionar morador</option>
                  {moradores?.map(m => <option key={m.id} value={m.id}>Lote {m.lote} — {m.nome}</option>)}
                </select>
              </div>

              {[
                { label: 'Remetente', key: 'remetente', placeholder: 'Amazon, Mercado Livre...' },
                { label: 'Transportadora', key: 'transportadora', placeholder: 'Correios, Jadlog...' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>{f.label}</label>
                  <input type="text" value={form[f.key as keyof typeof form]} onChange={e => upd(f.key, e.target.value)} placeholder={f.placeholder} required style={inputStyle} />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Tipo</label>
                  <select value={form.tipo} onChange={e => upd('tipo', e.target.value)} style={inputStyle}>
                    {['Caixa', 'Sacola', 'Envelope', 'Outros'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Tamanho</label>
                  <select value={form.tamanho} onChange={e => upd('tamanho', e.target.value)} style={inputStyle}>
                    {['Pequeno', 'Médio', 'Grande', 'Extra Grande'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={criar.isPending}
                style={{ width: '100%', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {criar.isPending ? 'Registrando...' : 'Registrar Encomenda'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
