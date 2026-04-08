const launches = [
  { date: '2026-04-08', description: 'Recebimento de cliente', type: 'Entrada', amount: 'R$ 4.500', category: 'Recebimentos' },
  { date: '2026-04-08', description: 'Pagamento fornecedor', type: 'Saída', amount: 'R$ 1.250', category: 'Fornecedores' },
];

export default function LancamentosPage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Lançamentos</h1>
      <p>Base inicial para o fluxo operacional de entradas e saídas.</p>
      <div style={{ display: 'grid', gap: 16 }}>
        {launches.map((launch) => (
          <div key={`${launch.date}-${launch.description}`} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{launch.description}</div>
                <div style={{ marginTop: 8, color: '#667085' }}>{launch.date} · {launch.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>{launch.amount}</div>
                <div style={{ marginTop: 8, color: '#667085' }}>{launch.type}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
