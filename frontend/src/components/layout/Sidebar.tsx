'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Package, CalendarDays, AlertTriangle, Shield, DoorOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { group: 'GESTÃO', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Moradores', href: '/moradores', icon: Users },
    { label: 'Encomendas', href: '/encomendas', icon: Package },
    { label: 'Reservas', href: '/reservas', icon: CalendarDays },
    { label: 'Ocorrências', href: '/ocorrencias', icon: AlertTriangle },
    { label: 'Acessos', href: '/acessos', icon: Shield },
  ]},
  { group: 'OPERAÇÃO', items: [
    { label: 'Porteiro', href: '/porteiro', icon: DoorOpen },
  ]},
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside style={{ width: '240px', minHeight: '100vh', background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, zIndex: 50 }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--gold)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: '700', color: '#0A0A0A' }}>RC</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: '600', color: 'var(--text)', lineHeight: 1.2 }}>Rovean Condo</div>
            <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>Alphaville Eusébio</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {navItems.map(group => (
          <div key={group.group} style={{ marginBottom: '24px' }}>
            <div style={{ padding: '0 16px 8px', fontSize: '10px', fontWeight: '600', color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{group.group}</div>
            {group.items.map(item => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 16px',
                    marginLeft: '8px', marginRight: '8px',
                    borderRadius: '6px',
                    borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
                    background: active ? 'var(--gold-dim)' : 'transparent',
                    color: active ? 'var(--gold)' : 'var(--text-2)',
                    fontSize: '13px', fontWeight: active ? '500' : '400',
                    textDecoration: 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '4px' }}>v1.0.0</div>
        <div style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: '500' }}>{user?.nome || 'Usuário'}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{user?.perfil}</div>
      </div>
    </aside>
  );
}
