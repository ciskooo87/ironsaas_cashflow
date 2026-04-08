"use client";

import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';
import { clearStoredUser, useSessionUser } from '@/lib/session';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dfc', label: 'DFC' },
  { href: '/lancamentos', label: 'Lançamentos' },
  { href: '/contas', label: 'Contas' },
  { href: '/categorias', label: 'Categorias' },
  { href: '/recorrencias', label: 'Recorrências' },
  { href: '/usuarios', label: 'Usuários' },
];

export function AppShell({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useSessionUser();

  function logout() {
    clearToken();
    clearStoredUser();
    router.push('/login');
    router.refresh();
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f4f7fb 100%)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '32px 24px 56px' }}>
        <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid #eaecf0', borderRadius: 28, padding: 28, boxShadow: '0 24px 60px rgba(15,23,42,0.08)', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ height: 56, borderRadius: 18, overflow: 'hidden', border: '1px solid #eaecf0', background: '#fff', boxShadow: '0 10px 24px rgba(15,23,42,0.08)', display: 'grid', placeItems: 'center', padding: '0 14px' }}>
                  <img src="/cashflow/brand/ironcore-logo-v2.jpg" alt="Ironcore" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800 }}>Ironcore</div>
                  <div style={{ fontSize: 15, color: '#475467', fontWeight: 700 }}>Cashflow</div>
                </div>
              </div>
              <h1 style={{ margin: '16px 0 0', fontSize: 42, lineHeight: 1.05, letterSpacing: '-0.04em', color: '#101828' }}>{title}</h1>
              {subtitle ? <p style={{ color: '#475467', marginTop: 12, maxWidth: 760, fontSize: 16, lineHeight: 1.7 }}>{subtitle}</p> : null}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {user ? (
                <div style={{ textAlign: 'right', background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 18, padding: '12px 14px' }}>
                  <div style={{ fontWeight: 800, color: '#101828' }}>{user.name}</div>
                  <div style={{ color: '#667085', fontSize: 14 }}>{user.email}</div>
                </div>
              ) : null}
              {actions}
              {user ? (
                <button onClick={logout} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '12px 16px', fontWeight: 800, boxShadow: '0 4px 14px rgba(16,24,40,0.04)' }}>
                  Sair
                </button>
              ) : null}
            </div>
          </div>

          <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    textDecoration: 'none',
                    color: active ? '#fff' : '#344054',
                    background: active ? 'linear-gradient(135deg, #111827 0%, #1d2939 100%)' : '#fff',
                    border: active ? '1px solid #111827' : '1px solid #d0d5dd',
                    borderRadius: 999,
                    padding: '11px 16px',
                    fontWeight: 800,
                    boxShadow: active ? '0 12px 28px rgba(17,24,39,0.22)' : '0 4px 12px rgba(16,24,40,0.04)',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {children}
      </div>
    </main>
  );
}
