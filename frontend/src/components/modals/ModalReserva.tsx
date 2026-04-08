'use client';
import { useState } from 'react';
import { X, CalendarDays } from 'lucide-react';
import { useCreateReserva } from '@/hooks/useReservas';
import { useMoradores } from '@/hooks/useMoradores';
import api from '@/lib/api';

interface Props { open: boolean; onClose: () => void; }

const areas = ['Churrasqueira', 'Salão de Festas', 'Academia', 'Piscina', 'Quadra', 'Espaço Gourmet'];

export default function ModalReserva({ open, onClose }: Props) {
  const [form, setForm] = useState({ moradorId: '', areaComum: '', dataReserva: '', horarioInicio: '', horarioFim: '', observacoes: '' });
  const [error, setError] = useState('');
  const criar = useCreateReserva();
  const { data: moradores } = useMoradores(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const dispRes = await api.get('/reservas/disponibilidade', { params: { area: form.areaComum, data: form.dataReserva } });
      const ocupados = dispRes.data.data.horariosOcupados as { inicio: string; fim: string }[];
      const conflito = ocupados.some(h => {
        const a = toMin(form.horarioInicio), b = toMin(form.horarioFim);
        const c = toMin(h.inicio), d = toMin(h.fim);
        return a < d && b > c;
      });
      if (conflito) { setError('Horário conflita com uma reserva existente.'); return; }
      await criar.mutateAsync({ ...form, moradorId: parseInt(form.moradorId) } as any);
      onClose();
      setForm({ moradorId: '', areaComum: '', dataReserva: '', horarioInicio: '', horarioFim: '', observacoes: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar reserva.');
    }
  };

  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '460px', zIndex: 1 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarDays size={18} color="var(--gold)" />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Nova Reserva</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: '8px', padding: '10px', marginBottom: '14px', color: 'var(--red)', fontSize: '12px' }}>{error}</div>}
          {[
            { label: 'Morador', key: 'moradorId', type: 'select' },
            { label: 'Área Comum', key: 'areaComum', type: 'select-area' },
            { label: 'Data', key: 'dataReserva', type: 'date' },
            { label: 'Horário Início', key: 'horarioInicio', type: 'time' },
            { label: 'Horário Fim', key: 'horarioFim', type: 'time' },
            { label: 'Observações (opcional)', key: 'observacoes', type: 'text' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key as keyof typeof form]} onChange={e => upd(f.key, e.target.value)} required
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px' }}>
                  <option value="">Selecionar morador</option>
                  {moradores?.map(m => <option key={m.id} value={m.id}>Lote {m.lote} — {m.nome}</option>)}
                </select>
              ) : f.type === 'select-area' ? (
                <select value={form[f.key as keyof typeof form]} onChange={e => upd(f.key, e.target.value)} required
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px' }}>
                  <option value="">Selecionar área</option>
                  {areas.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              ) : (
                <input type={f.type} value={form[f.key as keyof typeof form]} onChange={e => upd(f.key, e.target.value)} required={f.type !== 'text'}
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px' }} />
              )}
            </div>
          ))}
          <button type="submit" disabled={criar.isPending}
            style={{ width: '100%', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' }}>
            {criar.isPending ? 'Criando...' : 'Criar Reserva'}
          </button>
        </form>
      </div>
    </div>
  );
}
