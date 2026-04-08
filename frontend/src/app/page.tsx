import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';

const cards = [
  { title: 'Empresas', text: 'Base multiempresa para segregar operação e governança.', href: '/dashboard' },
  { title: 'Contas', text: 'Saldo por conta e base estruturada para consolidação.', href: '/contas' },
  { title: 'Categorias', text: 'Estrutura financeira pronta para DFC automático.', href: '/categorias' },
  { title: 'Lançamentos', text: 'CRUD de entradas e saídas com classificação.', href: '/lancamentos' },
  { title: 'Novo lançamento', text: 'Formulário operacional com comprovante e sugestão de categoria.', href: '/lancamentos/novo' },
  { title: 'Dashboard', text: 'Camada inicial pronta para visão executiva.', href: '/dashboard' },
];

export default function Home() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 32, maxWidth: 1180, margin: '0 auto', color: '#0f172a' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#667085', fontWeight: 700 }}>IronSaaS Cashflow</div>
        <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: '12px 0 0', maxWidth: 840 }}>Controle de saldo, lançamentos e DFC com base pronta para escala.</h1>
        <p style={{ fontSize: 18, lineHeight: 1.7, color: '#475467', maxWidth: 820 }}>Sprint A fechado e Sprint B iniciado com upload de comprovante, classificação por regra e fluxo inicial de autenticação.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'start' }}>
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
        <LoginForm />
      </div>
    </main>
  );
}
