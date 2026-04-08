import { API_BASE } from '@/lib/api';

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/companies/1/categories`, { cache: 'no-store', headers: { Authorization: 'Bearer demo' } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoriasPage() {
  const categories = await getCategories();
  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Categorias</h1>
      <p>Estrutura base para classificação e DFC automático.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e2e8f0' }}>Nome</th>
            <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e2e8f0' }}>Grupo</th>
            <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e2e8f0' }}>Direção</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category: any) => (
            <tr key={category.id}>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.name}</td>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.group_type}</td>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.direction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
