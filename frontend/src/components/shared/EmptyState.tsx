import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-3)' }}>
      <Icon size={40} style={{ margin: '0 auto 12px' }} />
      <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-2)' }}>{title}</p>
      {description && <p style={{ fontSize: '12px', marginTop: '4px' }}>{description}</p>}
    </div>
  );
}
