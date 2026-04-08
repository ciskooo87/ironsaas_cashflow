"use client";

import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { LoginForm } from '@/components/LoginForm';
import { useSessionUser } from '@/lib/session';

const cards = [
  { title: 'Dashboard', text: 'Leitura executiva do caixa, do DFC e do risco projetado.', href: '/dashboard' },
  { title: 'Lançamentos', text: 'Entradas e saídas com comprovante e classificação.', href: '/lancamentos' },
  { title: 'Contas', text: 'Base de caixa e bancos para consolidação.', href: '/contas' },
  { title: 'Categorias', text: 'Estrutura financeira que sustenta DFC e análise.', href: '/categorias' },
  { title: 'Recorrências', text: 'Fluxos previsíveis para melhorar a projeção.', href: '/recorrencias' },
  { title: 'Novo lançamento', text: 'Atalho operacional para alimentar o caixa rápido.', href: '/lancamentos/novo' },
];

export default function Home() {
  const { user, companyId, loading } = useSessionUser();

  return (
    <AppShell
      title="Início"
      subtitle="Controle de saldo, lançamentos, DFC e projeção de caixa com fluxo operacional mais direto."
      actions={user ? <Link href="/dashboard" style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Abrir dashboard</Link> : undefined}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'start' }}>
        <section style={{ display: 'grid', gap: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24 }}>
            <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#667085', fontWeight: 700 }}>Contexto atual</div>
            {loading ? (
              <div style={{ marginTop: 12, color: '#475467' }}>Carregando sessão...</div>
            ) : user ? (
              <>
                <h2 style={{ margin: '10px 0 0' }}>Bem-vindo de volta, {user.name}.</h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: '#475467', marginTop: 10 }}>
                  Sua sessão está ativa na empresa <strong>#{companyId}</strong>. Você já pode entrar no dashboard, lançar movimentações e revisar a estrutura financeira sem reconfigurar contexto.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
                  <Link href="/dashboard" style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Ir para dashboard</Link>
                  <Link href="/lancamentos/novo" style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Registrar lançamento</Link>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ margin: '10px 0 0' }}>Entre para carregar a operação.</h2>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: '#475467', marginTop: 10 }}>
                  Depois do login, o app conecta automaticamente a empresa do usuário e libera dashboard, contas, categorias, lançamentos e recorrências no contexto correto.
                </p>
              </>
            )}
          </div>

          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            {cards.map((card) => (
              <Link key={card.title} href={card.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 20, padding: 20, background: '#fff', boxShadow: '0 12px 30px rgba(15,23,42,0.04)', minHeight: 170 }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#98A2B3', fontWeight: 700 }}>Módulo</div>
                  <div style={{ marginTop: 12, fontSize: 22, fontWeight: 700 }}>{card.title}</div>
                  <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7, color: '#475467' }}>{card.text}</div>
                </div>
              </Link>
            ))}
          </section>
        </section>

        {!user ? <LoginForm /> : (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>Atalhos</div>
              <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                <Link href="/contas" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700 }}>Gerenciar contas</Link>
                <Link href="/categorias" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700 }}>Revisar categorias</Link>
                <Link href="/recorrencias" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700 }}>Ajustar recorrências</Link>
              </div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, color: '#475467', lineHeight: 1.7 }}>
              O app já está pronto para operar com login, projeção, DFC, alertas e fluxo financeiro básico. O próximo ganho agora é enriquecer a leitura analítica do dashboard e reduzir mais atrito nos fluxos operacionais.
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
