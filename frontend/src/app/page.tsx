import Link from 'next/link';
import { LoginForm } from '@/components/LoginForm';

const cards = [
  ['Dashboard', 'Leitura executiva do caixa, DFC, projeção e pagamentos do dia.', '/dashboard'],
  ['DFC', 'Fluxo de caixa detalhado por bloco e composição por categoria.', '/dfc'],
  ['Lançamentos', 'Entradas e saídas com filtros, edição e baixa lógica.', '/lancamentos'],
  ['Contas', 'Base de caixa e bancos com saldo ajustável.', '/contas'],
  ['Categorias', 'Estrutura de classificação financeira e DFC automático.', '/categorias'],
  ['Recorrências', 'Fluxos previsíveis para projeção e disciplina financeira.', '/recorrencias'],
];

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f8fafc 0%, #f4f7fb 100%)' }}>
      <div className="oc-page-pad" style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 20px 40px' }}>
        <div className="oc-grid-sidebar" style={{ display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 24, alignItems: 'start' }}>
          <section style={{ display: 'grid', gap: 20 }}>
            <div className="oc-shell-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ height: 56, borderRadius: 18, overflow: 'hidden', border: '1px solid #eaecf0', background: '#fff', boxShadow: '0 10px 24px rgba(15,23,42,0.08)', display: 'grid', placeItems: 'center', padding: '0 14px' }}>
                  <img src="/cashflow/brand/ironcore-logo-v2.jpg" alt="Ironcore" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800 }}>Ironcore</div>
                  <div style={{ fontSize: 15, color: '#475467', fontWeight: 700 }}>Cashflow</div>
                </div>
              </div>
              <h1 className="oc-hero-title" style={{ margin: '18px 0 0', fontSize: 52, lineHeight: 1.02, letterSpacing: '-0.05em', color: '#101828' }}>Controle de caixa com leitura executiva e operação real.</h1>
              <p style={{ margin: '14px 0 0', color: '#475467', fontSize: 16, lineHeight: 1.8, maxWidth: 700 }}>
                Acesse o ambiente para operar contas, categorias, lançamentos, recorrências, DFC detalhado e projeção de caixa no mesmo produto.
              </p>
              <div className="oc-mobile-stack" style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/dashboard" style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', borderRadius: 14, padding: '13px 16px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }}>Abrir dashboard</Link>
                <Link prefetch={false} href="/lancamentos/novo" style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '13px 16px', fontWeight: 800, textDecoration: 'none' }}>Novo lançamento</Link>
              </div>
            </div>

            <section className="oc-grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
              {cards.map(([title, text, href]) => (
                <Link key={href} href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="oc-shell-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 20, boxShadow: '0 16px 40px rgba(15,23,42,0.05)', minHeight: 170 }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#98A2B3', fontWeight: 800 }}>Módulo</div>
                    <div className="oc-card-title" style={{ marginTop: 12, fontSize: 22, fontWeight: 800, color: '#101828' }}>{title}</div>
                    <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.75, color: '#475467' }}>{text}</div>
                  </div>
                </Link>
              ))}
            </section>
          </section>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
