interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDENTE:      { label: 'Pendente',     color: 'var(--amber)', bg: 'var(--amber-bg)' },
  RETIRADA:      { label: 'Retirada',     color: 'var(--green)', bg: 'var(--green-bg)' },
  CONFIRMADA:    { label: 'Confirmada',   color: 'var(--green)', bg: 'var(--green-bg)' },
  CANCELADA:     { label: 'Cancelada',    color: 'var(--red)',   bg: 'var(--red-bg)' },
  ABERTA:        { label: 'Aberta',       color: 'var(--amber)', bg: 'var(--amber-bg)' },
  EM_ANDAMENTO:  { label: 'Em Andamento', color: 'var(--blue)',  bg: 'var(--blue-bg)' },
  RESOLVIDA:     { label: 'Resolvida',    color: 'var(--green)', bg: 'var(--green-bg)' },
  autorizado:    { label: 'Autorizado',   color: 'var(--green)', bg: 'var(--green-bg)' },
  negado:        { label: 'Negado',       color: 'var(--red)',   bg: 'var(--red-bg)' },
  ativo:         { label: 'Ativo',        color: 'var(--green)', bg: 'var(--green-bg)' },
  inativo:       { label: 'Inativo',      color: 'var(--red)',   bg: 'var(--red-bg)' },
  'QR Code':     { label: 'QR Code',      color: 'var(--blue)',  bg: 'var(--blue-bg)' },
  Manual:        { label: 'Manual',       color: 'var(--text-2)', bg: 'var(--surface-3)' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status] || { label: status, color: 'var(--text-2)', bg: 'var(--surface-3)' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: '20px',
      background: cfg.bg, color: cfg.color,
      fontSize: '11px', fontWeight: '500',
    }}>
      {cfg.label}
    </span>
  );
}
