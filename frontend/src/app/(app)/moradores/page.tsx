'use client';
import { useState } from 'react';
import { useMoradores, useCreateMorador } from '@/hooks/useMoradores';
import { useMorador } from '@/hooks/useMoradores';
import { Morador } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import ModalMorador from '@/components/modals/ModalMorador';
import EmptyState from '@/components/shared/EmptyState';
import { Users, Plus, Search, X, Phone, Mail } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  color: 'var(--text-3)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '5px',
};

export default function MoradoresPage() {
  const { user } = useAuth();
  const { data: moradores, isLoading } = useMoradores();
  const createMorador = useCreateMorador();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [form, setForm] = useState({
    lote: '', nome: '', telefone: '', email: '',
    veiculo: '', iniciais: '', telegramId: '',
  });

  const { data: selectedMorador } = useMorador(selectedId || 0);

  const filtered = moradores?.filter(m =>
    m.nome.toLowerCase().includes(search.toLowerCase()) ||
    m.lote.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleCardClick = (id: number) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const autoInitials = (nome: string) => {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    try {
      const data = { ...form, iniciais: form.iniciais || autoInitials(form.nome) };
      await createMorador.mutateAsync(data);
      setCreateOpen(false);
      setForm({ lote: '', nome: '', telefone: '', email: '', veiculo: '', iniciais: '', telegramId: '' });
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Erro ao criar morador.');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: 'var(--text)' }}>Moradores</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '3px' }}>
            {moradores?.length || 0} moradores cadastrados · {moradores?.filter(m => m.ativo).length || 0} ativos
          </p>
        </div>
        {user?.perfil === 'ADMIN' && (
          <button onClick={() => setCreateOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <Plus size={15} /> Novo Morador
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px', maxWidth: '400px' }}>
        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
        <input
          type="text"
          placeholder="Buscar por nome ou lote..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: '36px' }}
        />
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>Carregando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum morador encontrado" description="Tente ajustar o filtro de busca." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {filtered.map(m => (
            <div
              key={m.id}
              onClick={() => handleCardClick(m.id)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
                padding: '20px', cursor: 'pointer', transition: 'all 0.2s',
                opacity: m.ativo ? 1 : 0.6,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--gold-dim2)', border: '1.5px solid var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '600', color: 'var(--gold)' }}>{m.iniciais}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', lineHeight: 1.3 }}>{m.nome}</div>
                    <div style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: '500', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LOTE {m.lote}</div>
                  </div>
                </div>
                <StatusBadge status={m.ativo ? 'ativo' : 'inativo'} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={11} color="var(--text-3)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{m.telefone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={11} color="var(--text-3)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>{m.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal detalhes */}
      <ModalMorador morador={selectedMorador || null} open={modalOpen} onClose={() => setModalOpen(false)} />

      {/* Modal criar morador */}
      {createOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setCreateOpen(false)} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', zIndex: 1 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={18} color="var(--gold)" />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Novo Morador</h3>
              </div>
              <button onClick={() => setCreateOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ padding: '24px' }}>
              {createError && (
                <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: '8px', padding: '10px', marginBottom: '14px', color: 'var(--red)', fontSize: '12px' }}>{createError}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[
                  { label: 'Lote', key: 'lote', placeholder: '01' },
                  { label: 'Iniciais (auto)', key: 'iniciais', placeholder: 'CA' },
                  { label: 'Nome completo', key: 'nome', placeholder: 'Carlos Alberto...', span: true },
                  { label: 'Telefone', key: 'telefone', placeholder: '(85) 99999-0000' },
                  { label: 'Email', key: 'email', placeholder: 'email@...', type: 'email' },
                  { label: 'Veículo (opcional)', key: 'veiculo', placeholder: 'Toyota Corolla...', span: true },
                  { label: 'Telegram ID (opcional)', key: 'telegramId', placeholder: '123456789' },
                ].map(f => (
                  <div key={f.key} style={f.span ? { gridColumn: '1 / -1' } : {}}>
                    <label style={labelStyle}>{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => {
                        upd(f.key, e.target.value);
                        if (f.key === 'nome' && !form.iniciais) {
                          upd('iniciais', autoInitials(e.target.value));
                        }
                      }}
                      placeholder={f.placeholder}
                      required={!['veiculo', 'telegramId', 'iniciais'].includes(f.key)}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
              <button type="submit" disabled={createLoading}
                style={{ width: '100%', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '20px' }}>
                {createLoading ? 'Criando...' : 'Criar Morador'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
