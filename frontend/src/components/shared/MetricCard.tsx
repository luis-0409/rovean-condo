'use client';
import { useRouter } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bg: string;
  href?: string;
}

export default function MetricCard({ label, value, icon: Icon, color, bg, href }: MetricCardProps) {
  const router = useRouter();
  return (
    <div
      onClick={() => href && router.push(href)}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px',
        padding: '20px 24px', cursor: href ? 'pointer' : 'default',
        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '16px',
      }}
      onMouseEnter={e => { if (href) (e.currentTarget as HTMLDivElement).style.borderColor = color; }}
      onMouseLeave={e => { if (href) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
    >
      <div style={{ width: '44px', height: '44px', background: bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text)', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  );
}
