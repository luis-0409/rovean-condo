interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
      <div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: 'var(--text)' }}>{title}</h2>
        {description && <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '3px' }}>{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
