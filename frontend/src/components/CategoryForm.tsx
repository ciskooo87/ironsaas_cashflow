"use client";

import { useState } from 'react';
import { apiPost } from '@/lib/api';

export function CategoryForm() {
  const [status, setStatus] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiPost('/categories', {
        company_id: 1,
        name: form.get('name'),
        group_type: form.get('group_type'),
        direction: form.get('direction'),
      });
      setStatus('Categoria criada. Recarregue a página.');
      e.currentTarget.reset();
    } catch {
      setStatus('Falha ao criar categoria.');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
      <h2 style={{ margin: 0 }}>Nova categoria</h2>
      <input name="name" placeholder="Nome da categoria" required style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <select name="group_type" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }}>
        <option value="operacional">Operacional</option>
        <option value="investimento">Investimento</option>
        <option value="financiamento">Financiamento</option>
      </select>
      <select name="direction" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }}>
        <option value="ambos">Ambos</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>
      <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 0, borderRadius: 12, padding: '14px 18px', fontWeight: 700 }}>Criar categoria</button>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
