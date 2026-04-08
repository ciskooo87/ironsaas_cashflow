import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 32, background: 'linear-gradient(180deg, #f8fafc 0%, #f4f7fb 100%)' }}>
      <div style={{ width: '100%', maxWidth: 1120, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 28, alignItems: 'center' }}>
        <section style={{ display: 'grid', gap: 18 }}>
          <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800 }}>IronSaaS Cashflow</div>
          <h1 style={{ margin: 0, fontSize: 56, lineHeight: 1.02, letterSpacing: '-0.05em', color: '#101828' }}>Controle financeiro com leitura executiva e fluxo real de caixa.</h1>
          <p style={{ margin: 0, color: '#475467', fontSize: 16, lineHeight: 1.8, maxWidth: 620 }}>Acesse o ambiente para operar contas, lançamentos, DFC, recorrências, projeção de caixa e painéis executivos no mesmo produto.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
            {[
              ['DFC', 'Blocos operacionais, investimento e financiamento.'],
              ['Projeção', 'Fluxo futuro com recorrências e risco de liquidez.'],
              ['Operação', 'Lançamentos, contas, categorias e recorrências em fluxo real.'],
            ].map(([title, text]) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #eaecf0', borderRadius: 20, padding: 18, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
                <div style={{ fontWeight: 800, color: '#101828' }}>{title}</div>
                <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.7, color: '#667085' }}>{text}</div>
              </div>
            ))}
          </div>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
