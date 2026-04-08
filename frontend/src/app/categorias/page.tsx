const categories = [
  { name: 'Recebimentos', group: 'Operacional', direction: 'Entrada' },
  { name: 'Fornecedores', group: 'Operacional', direction: 'Saída' },
  { name: 'Capex', group: 'Investimento', direction: 'Saída' },
  { name: 'Empréstimos', group: 'Financiamento', direction: 'Entrada' },
];

export default function CategoriasPage() {
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
          {categories.map((category) => (
            <tr key={category.name}>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.name}</td>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.group}</td>
              <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.direction}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
