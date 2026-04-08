'use client';
import { useState } from 'react';
import { Encomenda } from '@/types';
import StatusBadge from '../shared/StatusBadge';
import { formatDateTime } from '@/lib/utils';
import { X, Package, Truck, Box, Loader2, CheckCircle, Send, Sparkles, AlertCircle } from 'lucide-react';
import { useRetirarEncomenda, useGerarMensagemEncomenda, useEnviarNotificacaoEncomenda } from '@/hooks/useEncomendas';

interface Props {
  encomenda: Encomenda | null;
  open: boolean;
  onClose: () => void;
}

export default function ModalEncomenda({ encomenda, open, onClose }: Props) {
  const [mensagem, setMensagem] = useState('');
  const [temTelegram, setTemTelegram] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');

  const retirar = useRetirarEncomenda();
  const gerarMensagem = useGerarMensagemEncomenda();
  const enviarNotificacao = useEnviarNotificacaoEncomenda();

  const handleGerar = async () => {
    if (!encomenda) return;
    setMensagem('');
    setEnviado(false);
    setErroEnvio('');
    try {
      const result = await gerarMensagem.mutateAsync(encomenda.id);
      setMensagem(result.mensagem);
      setTemTelegram(result.temTelegram);
    } catch {
      setErroEnvio('Erro ao gerar mensagem. Verifique a chave GROQ_API_KEY.');
    }
  };

  const handleEnviar = async () => {
    if (!encomenda || !mensagem.trim()) return;
    setErroEnvio('');
    try {
      await enviarNotificacao.mutateAsync({ id: encomenda.id, mensagem });
      setEnviado(true);
    } catch (err: any) {
      setErroEnvio(err.response?.data?.message || 'Erro ao enviar mensagem.');
    }
  };

  const handleRetirar = async () => {
    if (!encomenda) return;
    await retirar.mutateAsync(encomenda.id);
    onClose();
  };

  const handleClose = () => {
    setMensagem('');
    setEnviado(false);
    setErroEnvio('');
    onClose();
  };

  if (!open || !encomenda) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={handleClose} />
      <div style={{ position: 'relative', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '500px', zIndex: 1 }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={18} color="var(--gold)" />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Detalhes da Encomenda</h3>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {[
              { icon: Package, label: 'Destinatário', value: encomenda.morador?.nome || `Lote ${encomenda.moradorId}` },
              { icon: Truck, label: 'Remetente', value: encomenda.remetente },
              { icon: Truck, label: 'Transportadora', value: encomenda.transportadora },
              { icon: Box, label: 'Tipo', value: `${encomenda.tipo} · ${encomenda.tamanho}` },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '500' }}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* Status + data */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '10px 12px', background: 'var(--surface-2)', borderRadius: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: '3px' }}>Chegada</div>
              <div style={{ fontSize: '13px', color: 'var(--text)' }}>{formatDateTime(encomenda.dataChegada)}</div>
            </div>
            <StatusBadge status={encomenda.status} />
          </div>

          {/* Notificação via IA */}
          <div style={{ border: '1px solid var(--border-2)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: mensagem || gerarMensagem.isPending ? '12px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} color="var(--gold)" />
                <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-2)' }}>Notificar Morador</span>
              </div>
              <button
                onClick={handleGerar}
                disabled={gerarMensagem.isPending}
                style={{ fontSize: '11px', background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {gerarMensagem.isPending
                  ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Gerando...</>
                  : <><Sparkles size={11} /> Gerar com IA</>
                }
              </button>
            </div>

            {erroEnvio && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--red)', fontSize: '12px', marginBottom: '10px' }}>
                <AlertCircle size={13} /> {erroEnvio}
              </div>
            )}

            {enviado && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)', fontSize: '12px', padding: '8px', background: 'var(--green-bg)', borderRadius: '6px' }}>
                <CheckCircle size={13} /> Mensagem enviada com sucesso!
              </div>
            )}

            {mensagem && !enviado && (
              <>
                <textarea
                  value={mensagem}
                  onChange={e => setMensagem(e.target.value)}
                  rows={5}
                  style={{
                    width: '100%',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-2)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    resize: 'vertical',
                    outline: 'none',
                    lineHeight: '1.55',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                  {!temTelegram && (
                    <span style={{ fontSize: '11px', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={11} /> Morador sem Telegram cadastrado
                    </span>
                  )}
                  {temTelegram && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Você pode editar antes de enviar</span>}
                  <button
                    onClick={handleEnviar}
                    disabled={!temTelegram || enviarNotificacao.isPending}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: temTelegram ? 'var(--blue)' : 'var(--surface-3)',
                      color: temTelegram ? '#fff' : 'var(--text-3)',
                      border: 'none', borderRadius: '7px', padding: '7px 14px',
                      fontSize: '12px', fontWeight: '600',
                      cursor: temTelegram ? 'pointer' : 'not-allowed',
                      marginLeft: 'auto',
                    }}>
                    {enviarNotificacao.isPending
                      ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Enviando...</>
                      : <><Send size={12} /> Enviar via Telegram</>
                    }
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Confirmar retirada */}
          {encomenda.status === 'PENDENTE' && (
            <button
              onClick={handleRetirar}
              disabled={retirar.isPending}
              style={{ width: '100%', background: 'var(--green)', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
              {retirar.isPending ? 'Confirmando...' : 'Confirmar Retirada'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
