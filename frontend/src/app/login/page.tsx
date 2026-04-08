'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, senha);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--gold)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '700', color: '#0A0A0A' }}>RC</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>Rovean Condo</h1>
          <p style={{ color: 'var(--text-2)', fontSize: '13px' }}>Alphaville Eusébio · Bloco Mediterrâneo</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '32px' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '24px' }}>Entrar no sistema</h2>

          {error && (
            <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: 'var(--red)', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: 'var(--text-2)', fontSize: '12px', fontWeight: '500', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@rovean.com"
              required
              style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-2)', fontSize: '12px', fontWeight: '500', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showSenha ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '8px', padding: '10px 40px 10px 14px', color: 'var(--text)', fontSize: '14px', outline: 'none' }}
              />
              <button type="button" onClick={() => setShowSenha(!showSenha)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0' }}>
                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? 'var(--gold-dim2)' : 'var(--gold)', color: loading ? 'var(--gold)' : '#0A0A0A', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
          >
            <LogIn size={16} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '12px', marginTop: '24px' }}>
          Rovean Condo v1.0.0 · Sistema de Gestão
        </p>
      </div>
    </div>
  );
}
