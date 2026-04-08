export default function DashboardPage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Dashboard</h1>
      <p>Camada executiva inicial do Sprint A.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        {[
          ['Saldo consolidado', 'R$ 12.500'],
          ['Entradas', 'R$ 4.500'],
          ['Saídas', 'R$ 1.250'],
          ['Lançamentos', '2'],
        ].map(([title, value]) => (
          <div key={title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>{title}</div>
            <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
