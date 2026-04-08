export default function NovoLancamentoPage() {
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 32 }}>
      <h1>Novo lançamento</h1>
      <p>Formulário inicial do próximo sprint para criar entradas e saídas com comprovante.</p>
      <form style={{ display: 'grid', gap: 16, background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
          <input placeholder="Data" type="date" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
          <input placeholder="Descrição" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
          <input placeholder="Valor" type="number" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
          <select style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }}><option>Entrada</option><option>Saída</option></select>
          <input placeholder="Categoria" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
          <input placeholder="Subcategoria" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
          <input placeholder="Conta" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
          <input type="file" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
        </div>
        <textarea placeholder="Observações" style={{ minHeight: 120, padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
        <button type="button" style={{ background: '#0f172a', color: '#fff', border: 0, borderRadius: 12, padding: '14px 18px', fontWeight: 700, width: 220 }}>Salvar lançamento</button>
      </form>
    </main>
  );
}
