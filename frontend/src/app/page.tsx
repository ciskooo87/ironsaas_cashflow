"use client";

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { LoginForm } from '@/components/LoginForm';
import { useSessionUser } from '@/lib/session';

const cards = [
  { title: 'Dashboard', text: 'Leitura executiva do caixa, do DFC, da projeção e dos pagamentos do dia.', href: '/dashboard' },
  { title: 'DFC', text: 'Visão detalhada do fluxo de caixa por bloco e composição por categoria.', href: '/dfc' },
  { title: 'Lançamentos', text: 'Entradas e saídas com comprovante, filtros, edição e baixa lógica.', href: '/lancamentos' },
  { title: 'Contas', text: 'Base de caixa e bancos com saldo atual e saldo inicial ajustável.', href: '/contas' },
  { title: 'Categorias', text: 'Estrutura financeira que sustenta DFC e classificação automática.', href: '/categorias' },
  { title: 'Recorrências', text: 'Fluxos previsíveis para reforçar a projeção e o controle operacional.', href: '/recorrencias' },
];

export default function Home() {
  const { user, companyId, loading } = useSessionUser();

  return (
    <AppShell
      title="Início"
      subtitle="Ambiente operacional para caixa, DFC, projeção, lançamentos e recorrências com leitura executiva mais forte."
      actions={user ? <Link href="/dashboard" style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', borderRadius: 14, padding: '12px 16px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }}>Abrir dashboard</Link> : undefined}
    >
      <div className="oc-grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1.12fr 0.88fr', gap: 24, alignItems: 'start' }}>
        <section style={{ display: 'grid', gap: 24 }}>
          <div className="oc-shell-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
            <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800 }}>Contexto atual</div>
            {loading ? (
              <div style={{ marginTop: 14, color: '#475467' }}>Carregando sessão...</div>
            ) : user ? (
              <>
                <h2 className="oc-card-title" style={{ margin: '12px 0 0', fontSize: 30, lineHeight: 1.1 }}>Bem-vindo de volta, {user.name}.</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: '#475467', marginTop: 12, maxWidth: 720 }}>
                  Sua sessão está ativa na empresa <strong>#{companyId}</strong>. Você já pode entrar no dashboard, lançar movimentações, revisar DFC e operar o caixa no contexto correto.
                </p>
                <div className="oc-mobile-stack" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
                  <Link href="/dashboard" style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', borderRadius: 14, padding: '13px 16px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }}>Ir para dashboard</Link>
                  <Link prefetch={false} href="/lancamentos/novo" style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '13px 16px', fontWeight: 800, textDecoration: 'none' }}>Registrar lançamento</Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="oc-card-title" style={{ margin: '12px 0 0', fontSize: 30, lineHeight: 1.1 }}>Entre para carregar a operação financeira.</h2>
                <p style={{ fontSize: 16, lineHeight: 1.8, color: '#475467', marginTop: 12, maxWidth: 720 }}>
                  Depois do login, o app conecta automaticamente a empresa do usuário e libera dashboard, DFC, contas, categorias, lançamentos e recorrências no contexto correto.
                </p>
              </>
            )}
          </div>

          <section className="oc-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            {cards.map((card) => (
              <Link key={card.title} href={card.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="oc-shell-card" style={{ border: '1px solid #e2e8f0', borderRadius: 24, padding: 22, background: '#fff', boxShadow: '0 16px 40px rgba(15,23,42,0.05)', minHeight: 180 }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#98A2B3', fontWeight: 800 }}>Módulo</div>
                  <div className="oc-card-title" style={{ marginTop: 14, fontSize: 24, fontWeight: 800, color: '#101828' }}>{card.title}</div>
                  <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.8, color: '#475467' }}>{card.text}</div>
                </div>
              </Link>
            ))}
          </section>
        </section>

        {!user ? <LoginForm /> : (
          <div style={{ display: 'grid', gap: 16 }}>
            <div className="oc-shell-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>Atalhos</div>
              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                <Link href="/contas" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 800 }}>Gerenciar contas</Link>
                <Link href="/categorias" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 800 }}>Revisar categorias</Link>
                <Link href="/recorrencias" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 800 }}>Ajustar recorrências</Link>
                <Link href="/dfc" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 800 }}>Abrir DFC detalhado</Link>
              </div>
            </div>
            <div className="oc-shell-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, color: '#475467', lineHeight: 1.8, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
              O produto já opera com login, projeção, DFC, alertas e fluxo financeiro funcional. Agora a camada visual também está sendo refinada para ficar mais coesa, legível e com cara de software pronto para uso recorrente.
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
