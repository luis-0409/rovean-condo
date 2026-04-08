'use client';
import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { useOcorrencias, useCreateOcorrencia, useUpdateOcorrenciaStatus } from '@/hooks/useOcorrencias';
import { useMoradores } from '@/hooks/useMoradores';
import { Ocorrencia, StatusOcorrencia } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import ModalOcorrencia from '@/components/modals/ModalOcorrencia';
import EmptyState from '@/components/shared/EmptyState';
import { AlertTriangle, Plus, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const columns: { status: StatusOcorrencia; label: string; color: string; bg: string }[] = [
  { status: 'ABERTA', label: 'Aberta', color: 'var(--amber)', bg: 'var(--amber-bg)' },
  { status: 'EM_ANDAMENTO', label: 'Em Andamento', color: 'var(--blue)', bg: 'var(--blue-bg)' },
  { status: 'RESOLVIDA', label: 'Resolvida', color: 'var(--green)', bg: 'var(--green-bg)' },
];

const urgenciaColor: Record<string, string> = {
  Alta: 'var(--red)',
  Media: 'var(--amber)',
  Baixa: 'var(--green)',
};

function OcorrenciaCard({ ocorrencia, onClick }: { ocorrencia: Ocorrencia; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ocorrencia.id.toString(),
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: 0.5,
  } : {};

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px',
        padding: '12px', marginBottom: '10px', cursor: 'grab',
        transition: 'box-shadow 0.15s', ...style,
      }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', lineHeight: 1.3, flex: 1, marginRight: '8px' }}>{ocorrencia.titulo}</div>
        <button
          onClick={e => { e.stopPropagation(); onClick(); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: 'var(--text-3)', fontSize: '10px', flexShrink: 0, textDecoration: 'underline' }}
        >
          Ver
        </button>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '8px' }}>{ocorrencia.categoria}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', color: urgenciaColor[ocorrencia.urgencia] || 'var(--text-3)', fontWeight: '600' }}>{ocorrencia.urgencia}</span>
        <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>{formatDate(ocorrencia.createdAt)}</span>
      </div>
      {ocorrencia.morador && (
        <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--text-3)' }}>Lote {ocorrencia.morador.lote} — {ocorrencia.morador.nome}</div>
      )}
    </div>
  );
}

function DroppableColumn({ status, label, color, bg, children }: { status: StatusOcorrencia; label: string; color: string; bg: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  return (
    <div ref={setNodeRef} style={{
      flex: 1, minWidth: '280px',
      background: isOver ? bg : 'var(--surface)',
      border: `1px solid ${isOver ? color : 'var(--border)'}`,
      borderRadius: '12px', padding: '16px', transition: 'all 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
        <span style={{ fontSize: '12px', fontWeight: '600', color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      </div>
      {children}
    </div>
  );
}

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

export default function OcorrenciasPage() {
  const { data: ocorrencias } = useOcorrencias();
  const { data: moradores } = useMoradores(true);
  const criar = useCreateOcorrencia();
  const updateStatus = useUpdateOcorrenciaStatus();

  const [selected, setSelected] = useState<Ocorrencia | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const [form, setForm] = useState({
    moradorId: '', titulo: '', descricao: '', categoria: 'Manutenção', urgencia: 'Media',
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const ocorrenciaId = parseInt(active.id as string);
    const newStatus = over.id as StatusOcorrencia;

    const ocorrencia = ocorrencias?.find(o => o.id === ocorrenciaId);
    if (!ocorrencia || ocorrencia.status === newStatus) return;

    await updateStatus.mutateAsync({ id: ocorrenciaId, status: newStatus });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      const data: any = { ...form };
      if (!data.moradorId) delete data.moradorId;
      else data.moradorId = parseInt(data.moradorId);
      await criar.mutateAsync(data);
      setCreateOpen(false);
      setForm({ moradorId: '', titulo: '', descricao: '', categoria: 'Manutenção', urgencia: 'Media' });
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Erro ao criar ocorrência.');
    }
  };

  const activeOcorrencia = activeId ? ocorrencias?.find(o => o.id === parseInt(activeId)) : null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: 'var(--text)' }}>Ocorrências</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '3px' }}>
            {ocorrencias?.filter(o => o.status !== 'RESOLVIDA').length || 0} ocorrências em aberto
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={15} /> Nova Ocorrência
        </button>
      </div>

      {/* Kanban board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {columns.map(col => {
            const colItems = (ocorrencias || []).filter(o => o.status === col.status);
            return (
              <DroppableColumn key={col.status} {...col}>
                {colItems.length === 0 ? (
                  <EmptyState icon={AlertTriangle} title="Nenhuma" description="Arraste ou crie uma ocorrência." />
                ) : (
                  colItems.map(o => (
                    <OcorrenciaCard key={o.id} ocorrencia={o} onClick={() => { setSelected(o); setModalOpen(true); }} />
                  ))
                )}
                <div style={{ fontSize: '11px', color: 'var(--text-3)', textAlign: 'center', paddingTop: '8px' }}>
                  {colItems.length} item{colItems.length !== 1 ? 's' : ''}
                </div>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeOcorrencia && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px', width: '280px', boxShadow: '0 12px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{activeOcorrencia.titulo}</div>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <ModalOcorrencia ocorrencia={selected} open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Modal criar */}
      {createOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setCreateOpen(false)} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '480px', zIndex: 1 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={18} color="var(--amber)" />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Nova Ocorrência</h3>
              </div>
              <button onClick={() => setCreateOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: '24px' }}>
              {createError && <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: '8px', padding: '10px', marginBottom: '14px', color: 'var(--red)', fontSize: '12px' }}>{createError}</div>}

              {[
                { label: 'Morador (opcional)', key: 'moradorId', type: 'select-morador' },
                { label: 'Título', key: 'titulo', type: 'text', placeholder: 'Descreva brevemente...' },
                { label: 'Descrição', key: 'descricao', type: 'textarea', placeholder: 'Detalhes da ocorrência...' },
                { label: 'Categoria', key: 'categoria', type: 'select-categoria' },
                { label: 'Urgência', key: 'urgencia', type: 'select-urgencia' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>{f.label}</label>
                  {f.type === 'select-morador' ? (
                    <select value={form.moradorId} onChange={e => upd('moradorId', e.target.value)} style={inputStyle}>
                      <option value="">Condomínio (sem morador específico)</option>
                      {moradores?.map(m => <option key={m.id} value={m.id}>Lote {m.lote} — {m.nome}</option>)}
                    </select>
                  ) : f.type === 'select-categoria' ? (
                    <select value={form.categoria} onChange={e => upd('categoria', e.target.value)} style={inputStyle}>
                      {['Manutenção', 'Barulho', 'Limpeza', 'Elétrica', 'Segurança', 'Outros'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : f.type === 'select-urgencia' ? (
                    <select value={form.urgencia} onChange={e => upd('urgencia', e.target.value)} style={inputStyle}>
                      {['Alta', 'Media', 'Baixa'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea value={form[f.key as keyof typeof form]} onChange={e => upd(f.key, e.target.value)} placeholder={f.placeholder} required rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }} />
                  ) : (
                    <input type="text" value={form[f.key as keyof typeof form]} onChange={e => upd(f.key, e.target.value)} placeholder={f.placeholder} required
                      style={inputStyle} />
                  )}
                </div>
              ))}

              <button type="submit" disabled={criar.isPending}
                style={{ width: '100%', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                {criar.isPending ? 'Criando...' : 'Criar Ocorrência'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
