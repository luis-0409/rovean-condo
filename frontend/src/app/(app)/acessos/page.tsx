'use client';
import { useState } from 'react';
import { useAcessos, useCreateAcesso, useRegistrarSaida } from '@/hooks/useAcessos';
import { useMoradores } from '@/hooks/useMoradores';
import { Acesso } from '@/types';
import StatusBadge from '@/components/shared/StatusBadge';
import EmptyState from '@/components/shared/EmptyState';
import { ShieldCheck, QrCode, X, LogOut } from 'lucide-react';
import { formatDateTime, formatTime } from '@/lib/utils';
import QRCode from 'qrcode.react';

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

const VALIDADES = [
  { label: '24 horas', value: '24h' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: 'Permanente', value: 'permanente' },
];

export default function AcessosPage() {
  const today = new Date().toISOString().split('T')[0];
  const [dateFilter, setDateFilter] = useState(today);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrMoradorId, setQrMoradorId] = useState('');
  const [qrValidade, setQrValidade] = useState('24h');
  const [qrCode, setQrCode] = useState('');

  const { data: acessos, isLoading } = useAcessos(dateFilter);
  const { data: moradores } = useMoradores(true);
  const registrarSaida = useRegistrarSaida();

  const handleGerarQR = () => {
    const morador = moradores?.find(m => m.id === parseInt(qrMoradorId));
    if (!morador) return;
    const code = `RC-${morador.lote}-${Date.now()}`;
    setQrCode(code);
  };

  const handleSaida = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await registrarSaida.mutateAsync(id);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: 'var(--text)' }}>Acessos</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '3px' }}>
            {acessos?.length || 0} registros em {new Date(dateFilter + 'T12:00:00').toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ ...inputStyle, width: 'auto' }}
          />
          <button
            onClick={() => { setQrCode(''); setQrMoradorId(''); setQrModalOpen(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gold)', color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <QrCode size={15} /> Gerar QR Code
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>Carregando...</div>
        ) : !acessos || acessos.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Nenhum acesso registrado" />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Horário', 'Visitante', 'Lote', 'Responsável', 'Motivo', 'Tipo', 'Status', 'Ação'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text-3)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {acessos.map(a => (
                <tr
                  key={a.id}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={el => (el.currentTarget as HTMLTableRowElement).style.background = 'var(--surface-2)'}
                  onMouseLeave={el => (el.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                >
                  <td style={{ padding: '13px 16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{formatTime(a.dataEntrada)}</div>
                    {a.dataSaida && (
                      <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>Saída: {formatTime(a.dataSaida)}</div>
                    )}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--text)' }}>{a.nomeVisitante}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--gold)', fontWeight: '500' }}>Lote {a.lote}</td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--text-2)' }}>
                    {a.morador?.nome || '—'}
                  </td>
                  <td style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--text-2)' }}>{a.motivoVisita || '—'}</td>
                  <td style={{ padding: '13px 16px' }}><StatusBadge status={a.tipo} /></td>
                  <td style={{ padding: '13px 16px' }}><StatusBadge status={a.status} /></td>
                  <td style={{ padding: '13px 16px' }}>
                    {!a.dataSaida && a.status === 'autorizado' && (
                      <button
                        onClick={e => handleSaida(a.id, e)}
                        title="Registrar saída"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', color: 'var(--text-2)', cursor: 'pointer' }}>
                        <LogOut size={12} /> Saída
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Gerar QR Code */}
      {qrModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setQrModalOpen(false)} />
          <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '420px', zIndex: 1 }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <QrCode size={18} color="var(--gold)" />
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Gerar QR Code de Acesso</h3>
              </div>
              <button onClick={() => setQrModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ padding: '24px' }}>
              {!qrCode ? (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Morador / Lote</label>
                    <select value={qrMoradorId} onChange={e => setQrMoradorId(e.target.value)} style={inputStyle}>
                      <option value="">Selecionar morador</option>
                      {moradores?.map(m => (
                        <option key={m.id} value={m.id}>Lote {m.lote} — {m.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Validade</label>
                    <select value={qrValidade} onChange={e => setQrValidade(e.target.value)} style={inputStyle}>
                      {VALIDADES.map(v => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleGerarQR}
                    disabled={!qrMoradorId}
                    style={{ width: '100%', background: qrMoradorId ? 'var(--gold)' : 'var(--surface-3)', color: qrMoradorId ? '#0A0A0A' : 'var(--text-3)', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '600', cursor: qrMoradorId ? 'pointer' : 'not-allowed' }}>
                    Gerar QR Code
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ background: 'white', borderRadius: '12px', padding: '20px', display: 'inline-block', marginBottom: '16px' }}>
                    <QRCode value={qrCode} size={200} />
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '6px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{qrCode}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '20px' }}>
                    Validade: {VALIDADES.find(v => v.value === qrValidade)?.label}
                  </div>
                  <button
                    onClick={() => setQrCode('')}
                    style={{ background: 'var(--surface-2)', color: 'var(--text-2)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '9px 20px', fontSize: '13px', cursor: 'pointer' }}>
                    Gerar outro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
