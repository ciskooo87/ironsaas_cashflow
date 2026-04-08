import { API_BASE } from '@/lib/api';

async function getDashboard() {
  try {
    const res = await fetch(`${API_BASE}/companies/1/dashboard`, { cache: 'no-store', headers: { Authorization: 'Bearer demo' } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboard();
  const cards = data
    ? [
        ['Saldo consolidado', `R$ ${Number(data.consolidated_balance).toLocaleString('pt-BR')}`],
        ['Entradas', `R$ ${Number(data.inflows).toLocaleString('pt-BR')}`],
        ['Saídas', `R$ ${Number(data.outflows).toLocaleString('pt-BR')}`],
        ['Lançamentos', String(data.total_launches)],
      ]
    : [
        ['Saldo consolidado', '—'],
        ['Entradas', '—'],
        ['Saídas', '—'],
        ['Lançamentos', '—'],
      ];

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Dashboard</h1>
      <p>Camada executiva inicial do Sprint A.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        {cards.map(([title, value]) => (
          <div key={title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>{title}</div>
            <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
