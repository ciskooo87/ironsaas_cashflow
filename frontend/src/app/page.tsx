const cards = [
  { title: 'Empresas', text: 'Base multiempresa para segregar operação e governança.' },
  { title: 'Contas', text: 'Saldo por conta e base estruturada para consolidação.' },
  { title: 'Categorias', text: 'Estrutura financeira pronta para DFC automático.' },
  { title: 'Lançamentos', text: 'CRUD de entradas e saídas com classificação.' },
  { title: 'Saldo', text: 'Recalculo automático por conta sem fórmula manual.' },
  { title: 'Dashboard', text: 'Camada inicial pronta para visão executiva.' },
];

export default function Home() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 32, maxWidth: 1180, margin: '0 auto', color: '#0f172a' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#667085', fontWeight: 700 }}>IronSaaS Cashflow</div>
        <h1 style={{ fontSize: 44, lineHeight: 1.05, margin: '12px 0 0', maxWidth: 840 }}>Controle de saldo, lançamentos e DFC com base pronta para escala.</h1>
        <p style={{ fontSize: 18, lineHeight: 1.7, color: '#475467', maxWidth: 820 }}>Sprint A iniciado com backend FastAPI, domínio financeiro principal, saldo por conta, seed de ambiente e fundação para DFC, projeção e analytics.</p>
      </div>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        {cards.map((card) => (
          <div key={card.title} style={{ border: '1px solid #e2e8f0', borderRadius: 20, padding: 20, background: '#fff', boxShadow: '0 12px 30px rgba(15,23,42,0.04)' }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#98A2B3', fontWeight: 700 }}>Módulo</div>
            <div style={{ marginTop: 12, fontSize: 22, fontWeight: 700 }}>{card.title}</div>
            <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.7, color: '#475467' }}>{card.text}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 28, border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, background: '#f8fafc' }}>
        <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#98A2B3', fontWeight: 700 }}>Próximo ciclo</div>
        <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700 }}>Sprint A em execução</div>
        <ul style={{ marginTop: 16, color: '#475467', lineHeight: 1.8, paddingLeft: 18 }}>
          <li>Alembic e migrations reais</li>
          <li>Autenticação com usuário atual</li>
          <li>Seed inicial da empresa demo</li>
          <li>Front das telas operacionais</li>
          <li>Upload de comprovantes</li>
        </ul>
      </section>
    </main>
  );
}
