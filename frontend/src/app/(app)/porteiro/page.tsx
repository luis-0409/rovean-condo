'use client';
import { useState, useEffect, useRef } from 'react';
import { useMoradores } from '@/hooks/useMoradores';
import { useCreateEncomenda } from '@/hooks/useEncomendas';
import { useCreateAcesso } from '@/hooks/useAcessos';
import { Morador } from '@/types';
import { PackagePlus, ScanLine, UserSearch, CheckCircle, XCircle } from 'lucide-react';

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

type Panel = 'encomenda' | 'qrcode' | 'busca';

interface QrResult {
  success: boolean;
  morador?: Morador;
  message: string;
  visitante?: string;
  moradorNome?: string;
  lote?: string;
}

export default function PorteiroPage() {
  const [activePanel, setActivePanel] = useState<Panel>('encomenda');

  // Encomenda
  const [encForm, setEncForm] = useState({
    moradorId: '', remetente: '', tipo: 'Caixa', tamanho: 'Médio',
  });
  const [encSuccess, setEncSuccess] = useState(false);
  const [encError, setEncError] = useState('');

  // QR Code
  const [qrInput, setQrInput] = useState('');
  const [qrResult, setQrResult] = useState<QrResult | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Busca morador
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: moradores } = useMoradores(true);
  const criarEncomenda = useCreateEncomenda();
  const criarAcesso = useCreateAcesso();

  // Debounce busca
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchTerm]);

  const searchResults = debouncedTerm.length >= 2
    ? (moradores || []).filter(m =>
        m.nome.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
        m.lote.toLowerCase().includes(debouncedTerm.toLowerCase())
      )
    : [];

  const handleEncomenda = async (e: React.FormEvent) => {
    e.preventDefault();
    setEncError('');
    setEncSuccess(false);
    try {
      await criarEncomenda.mutateAsync({
        moradorId: parseInt(encForm.moradorId),
        remetente: encForm.remetente,
        transportadora: 'Portaria',
        tipo: encForm.tipo,
        tamanho: encForm.tamanho,
      } as any);
      setEncSuccess(true);
      setEncForm({ moradorId: '', remetente: '', tipo: 'Caixa', tamanho: 'Médio' });
      setTimeout(() => setEncSuccess(false), 4000);
    } catch (err: any) {
      setEncError(err.response?.data?.message || 'Erro ao registrar encomenda.');
    }
  };

  const handleValidarQR = async () => {
    if (!qrInput.trim()) return;
    setQrLoading(true);
    setQrResult(null);

    const codigo = qrInput.trim();

    // Convite de visitante gerado via Telegram
    if (codigo.startsWith('VISIT-')) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/convites/validar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ codigo }),
        });
        const data = await res.json();
        if (data.success) {
          setQrResult({ success: true, message: data.message, visitante: data.visitante, moradorNome: data.morador, lote: data.lote });
        } else {
          setQrResult({ success: false, message: data.message });
        }
      } catch {
        setQrResult({ success: false, message: 'Erro ao validar QR Code.' });
      }
      setQrLoading(false);
      return;
    }

    // Formato legado: RC-{lote}-{timestamp}
    const match = codigo.match(/^RC-(\d+)-\d+$/);
    if (!match) {
      setQrResult({ success: false, message: 'Código inválido ou formato não reconhecido.' });
      setQrLoading(false);
      return;
    }

    const lote = match[1];
    const morador = moradores?.find(m => m.lote === lote && m.ativo);
    if (!morador) {
      setQrResult({ success: false, message: `Nenhum morador ativo encontrado para o Lote ${lote}.` });
      setQrLoading(false);
      return;
    }

    try {
      await criarAcesso.mutateAsync({
        moradorId: morador.id,
        nomeVisitante: 'QR Code',
        lote: morador.lote,
        tipo: 'QR Code',
        status: 'autorizado',
      } as any);
      setQrResult({ success: true, morador, message: `Acesso autorizado para ${morador.nome}.` });
    } catch {
      setQrResult({ success: false, message: 'Erro ao registrar acesso.' });
    }
    setQrLoading(false);
  };

  const panels: { key: Panel; label: string; icon: React.ReactNode }[] = [
    { key: 'encomenda', label: 'Registrar Encomenda', icon: <PackagePlus size={20} /> },
    { key: 'qrcode',   label: 'Validar QR Code',      icon: <ScanLine size={20} /> },
    { key: 'busca',    label: 'Buscar Morador',        icon: <UserSearch size={20} /> },
  ];

  return (
    <div>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--gold-dim2) 0%, var(--gold-dim) 100%)',
        border: '1px solid var(--gold)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div style={{ width: '48px', height: '48px', background: 'var(--gold)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ScanLine size={24} color="#0A0A0A" />
        </div>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: 'var(--gold)' }}>Módulo Portaria</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '2px' }}>Operações rápidas para o porteiro</p>
        </div>
      </div>

      {/* Action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {panels.map(p => (
          <button
            key={p.key}
            onClick={() => setActivePanel(p.key)}
            style={{
              background: activePanel === p.key ? 'var(--gold-dim)' : 'var(--surface)',
              border: activePanel === p.key ? '1px solid var(--gold)' : '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
            <div style={{ color: activePanel === p.key ? 'var(--gold)' : 'var(--text-3)' }}>{p.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: activePanel === p.key ? 'var(--gold)' : 'var(--text)' }}>{p.label}</div>
          </button>
        ))}
      </div>

      {/* Panel: Registrar Encomenda */}
      {activePanel === 'encomenda' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', maxWidth: '520px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <PackagePlus size={18} color="var(--gold)" />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Registrar Encomenda</h3>
          </div>

          {encSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: 'var(--green)', fontSize: '13px' }}>
              <CheckCircle size={16} /> Encomenda registrada com sucesso!
            </div>
          )}
          {encError && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: '8px', padding: '12px', marginBottom: '16px', color: 'var(--red)', fontSize: '13px' }}>{encError}</div>
          )}

          <form onSubmit={handleEncomenda}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Destinatário (Morador)</label>
              <select value={encForm.moradorId} onChange={e => setEncForm(f => ({ ...f, moradorId: e.target.value }))} required style={inputStyle}>
                <option value="">Selecionar morador</option>
                {moradores?.map(m => (
                  <option key={m.id} value={m.id}>Lote {m.lote} — {m.nome}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Remetente</label>
              <input
                type="text"
                value={encForm.remetente}
                onChange={e => setEncForm(f => ({ ...f, remetente: e.target.value }))}
                placeholder="Amazon, Mercado Livre..."
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}>Tipo</label>
                <select value={encForm.tipo} onChange={e => setEncForm(f => ({ ...f, tipo: e.target.value }))} style={inputStyle}>
                  {['Caixa', 'Sacola', 'Envelope', 'Outros'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tamanho</label>
                <select value={encForm.tamanho} onChange={e => setEncForm(f => ({ ...f, tamanho: e.target.value }))} style={inputStyle}>
                  {['Pequeno', 'Médio', 'Grande', 'Extra Grande'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={criarEncomenda.isPending}
              style={{ width: '100%', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              {criarEncomenda.isPending ? 'Registrando...' : 'Confirmar Encomenda'}
            </button>
          </form>
        </div>
      )}

      {/* Panel: Validar QR Code */}
      {activePanel === 'qrcode' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', maxWidth: '520px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <ScanLine size={18} color="var(--gold)" />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Validar QR Code</h3>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              value={qrInput}
              onChange={e => { setQrInput(e.target.value); setQrResult(null); }}
              onKeyDown={e => e.key === 'Enter' && handleValidarQR()}
              placeholder="Ex: RC-01-1712345678901"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={handleValidarQR}
              disabled={!qrInput.trim() || qrLoading}
              style={{ background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {qrLoading ? '...' : 'Validar'}
            </button>
          </div>

          {qrResult && (
            <div style={{
              borderRadius: '10px',
              padding: '16px',
              border: `1px solid ${qrResult.success ? 'var(--green)' : 'var(--red)'}`,
              background: qrResult.success ? 'var(--green-bg)' : 'var(--red-bg)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}>
              {qrResult.success
                ? <CheckCircle size={20} color="var(--green)" style={{ flexShrink: 0, marginTop: '1px' }} />
                : <XCircle size={20} color="var(--red)" style={{ flexShrink: 0, marginTop: '1px' }} />
              }
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: qrResult.success ? 'var(--green)' : 'var(--red)', marginBottom: '4px' }}>
                  {qrResult.success ? 'Acesso Autorizado' : 'Acesso Negado'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>{qrResult.message}</div>
                {qrResult.visitante && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-3)' }}>
                    Visitante: {qrResult.visitante} · Lote {qrResult.lote} ({qrResult.moradorNome})
                  </div>
                )}
                {qrResult.morador && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-3)' }}>
                    Lote {qrResult.morador.lote} · {qrResult.morador.telefone}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Panel: Buscar Morador */}
      {activePanel === 'busca' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <UserSearch size={18} color="var(--gold)" />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Buscar Morador</h3>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Digite o nome ou número do lote..."
            style={{ ...inputStyle, marginBottom: '16px' }}
            autoFocus
          />

          {debouncedTerm.length >= 2 && searchResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-3)', fontSize: '13px' }}>
              Nenhum morador encontrado para "{debouncedTerm}"
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {searchResults.map(m => (
              <div
                key={m.id}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
                {/* Avatar */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'var(--gold-dim2)', border: '1px solid var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '700', color: 'var(--gold)', flexShrink: 0,
                }}>
                  {m.iniciais}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lote {m.lote}</span>
                    <span style={{
                      fontSize: '10px', padding: '1px 8px', borderRadius: '20px',
                      background: m.ativo ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: m.ativo ? 'var(--green)' : 'var(--red)',
                    }}>
                      {m.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', marginBottom: '2px' }}>{m.nome}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>{m.telefone}{m.veiculo ? ` · ${m.veiculo}` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
