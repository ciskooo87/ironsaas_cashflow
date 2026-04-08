import { API_BASE } from '@/lib/api';

async function getAccounts() {
  try {
    const res = await fetch(`${API_BASE}/companies/1/accounts`, { cache: 'no-store', headers: { Authorization: 'Bearer demo' } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ContasPage() {
  const accounts = await getAccounts();
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Contas</h1>
      <p>Base inicial do Sprint A para gestão das contas de caixa e banco.</p>
      <div style={{ display: 'grid', gap: 16 }}>
        {accounts.map((account: any) => (
          <div key={account.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{account.name}</div>
            <div style={{ color: '#667085', marginTop: 8 }}>{account.type}</div>
            <div style={{ marginTop: 12, fontWeight: 700 }}>R$ {Number(account.current_balance).toLocaleString('pt-BR')}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
