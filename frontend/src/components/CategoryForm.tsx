"use client";

import { useState } from 'react';
import { apiPost } from '@/lib/api';

type CategoryFormProps = {
  companyId: number | null;
  onCreated?: () => void;
};

const fieldStyle = { padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', background: '#fcfcfd', fontSize: 14 } as const;

export function CategoryForm({ companyId, onCreated }: CategoryFormProps) {
  const [status, setStatus] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!companyId) {
      setStatus('Faça login para criar categoria.');
      return;
    }
    const form = new FormData(e.currentTarget);
    try {
      await apiPost('/categories', {
        company_id: companyId,
        name: form.get('name'),
        group_type: form.get('group_type'),
        direction: form.get('direction'),
      });
      setStatus('Categoria criada com sucesso.');
      e.currentTarget.reset();
      onCreated?.();
    } catch {
      setStatus('Falha ao criar categoria.');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24 }}>Nova categoria</h2>
        <p style={{ margin: '8px 0 0', color: '#667085', fontSize: 14 }}>Estrutura que sustenta DFC, agrupamento e leitura financeira.</p>
      </div>
      <input name="name" placeholder="Nome da categoria" required style={fieldStyle} />
      <select name="group_type" style={fieldStyle}>
        <option value="operacional">Operacional</option>
        <option value="investimento">Investimento</option>
        <option value="financiamento">Financiamento</option>
      </select>
      <select name="direction" style={fieldStyle}>
        <option value="ambos">Ambos</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>
      <button type="submit" style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', border: 0, borderRadius: 14, padding: '14px 18px', fontWeight: 800, boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }} disabled={!companyId}>Criar categoria</button>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
