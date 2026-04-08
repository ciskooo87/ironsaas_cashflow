"use client";

import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearToken } from '@/lib/auth';
import { clearStoredUser, useSessionUser } from '@/lib/session';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/lancamentos', label: 'Lançamentos' },
  { href: '/contas', label: 'Contas' },
  { href: '/categorias', label: 'Categorias' },
  { href: '/recorrencias', label: 'Recorrências' },
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
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#667085', fontWeight: 700 }}>IronSaaS Cashflow</div>
          <h1 style={{ margin: '10px 0 0', fontSize: 36 }}>{title}</h1>
          {subtitle ? <p style={{ color: '#475467', marginTop: 10, maxWidth: 700 }}>{subtitle}</p> : null}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {user ? (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>{user.name}</div>
              <div style={{ color: '#667085', fontSize: 14 }}>{user.email}</div>
            </div>
          ) : null}
          {actions}
          {user ? (
            <button onClick={logout} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '12px 16px', fontWeight: 700 }}>
              Sair
            </button>
          ) : null}
        </div>
      </div>

      <nav style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                textDecoration: 'none',
                color: active ? '#fff' : '#0f172a',
                background: active ? '#0f172a' : '#fff',
                border: active ? '1px solid #0f172a' : '1px solid #d0d5dd',
                borderRadius: 999,
                padding: '10px 14px',
                fontWeight: 700,
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </main>
  );
}
