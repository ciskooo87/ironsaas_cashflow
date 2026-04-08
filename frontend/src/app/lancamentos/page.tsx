import { API_BASE } from '@/lib/api';

async function getLaunches() {
  try {
    const res = await fetch(`${API_BASE}/companies/1/launches`, { cache: 'no-store', headers: { Authorization: 'Bearer demo' } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function LancamentosPage() {
  const launches = await getLaunches();
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Lançamentos</h1>
      <p>Base inicial para o fluxo operacional de entradas e saídas.</p>
      <div style={{ display: 'grid', gap: 16 }}>
        {launches.map((launch: any) => (
          <div key={launch.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{launch.description}</div>
                <div style={{ marginTop: 8, color: '#667085' }}>{launch.launch_date} · {launch.category_id ?? 'Sem categoria'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700 }}>R$ {Number(launch.amount).toLocaleString('pt-BR')}</div>
                <div style={{ marginTop: 8, color: '#667085' }}>{launch.type}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
