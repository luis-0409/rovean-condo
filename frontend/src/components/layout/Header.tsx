'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Visão geral do condomínio' },
  '/moradores': { title: 'Moradores', subtitle: 'Gestão de residentes' },
  '/encomendas': { title: 'Encomendas', subtitle: 'Controle de entregas' },
  '/reservas': { title: 'Reservas', subtitle: 'Agendamento de áreas comuns' },
  '/ocorrencias': { title: 'Ocorrências', subtitle: 'Registro e acompanhamento' },
  '/acessos': { title: 'Acessos', subtitle: 'Controle de portaria' },
  '/porteiro': { title: 'Porteiro', subtitle: 'Módulo de operação' },
};

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dateTime, setDateTime] = useState('');
  const page = pageTitles[pathname] || { title: 'Rovean Condo', subtitle: '' };

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateTime(now.toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  const initials = user?.nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <header style={{
      position: 'sticky', top: 0, height: '64px', zIndex: 40,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
    }}>
      <div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: 'var(--text)', lineHeight: 1.2 }}>{page.title}</h1>
        {page.subtitle && <p style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '1px' }}>{page.subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-2)', textTransform: 'capitalize' }}>{dateTime}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'var(--gold-dim2)', border: '1px solid var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--gold)', fontSize: '13px', fontWeight: '600' }}>{initials}</span>
          </div>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
            title="Sair">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
