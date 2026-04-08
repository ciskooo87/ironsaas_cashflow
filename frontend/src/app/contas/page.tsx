const accounts = [
  { name: 'Banco Principal', type: 'Banco', balance: 'R$ 10.000' },
  { name: 'Caixa Operacional', type: 'Caixa', balance: 'R$ 2.500' },
];

export default function ContasPage() {
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Contas</h1>
      <p>Base inicial do Sprint A para gestão das contas de caixa e banco.</p>
      <div style={{ display: 'grid', gap: 16 }}>
        {accounts.map((account) => (
          <div key={account.name} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{account.name}</div>
            <div style={{ color: '#667085', marginTop: 8 }}>{account.type}</div>
            <div style={{ marginTop: 12, fontWeight: 700 }}>{account.balance}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
