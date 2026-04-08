"use client";

import { useState } from 'react';
import { apiPost } from '@/lib/api';

export function RecurringRuleForm() {
  const [status, setStatus] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiPost('/recurring-rules', {
        company_id: 1,
        account_id: Number(form.get('account_id')),
        category_id: form.get('category_id') ? Number(form.get('category_id')) : null,
        description: form.get('description'),
        amount: Number(form.get('amount')),
        type: form.get('type'),
        frequency: form.get('frequency'),
        day_of_month: form.get('day_of_month') ? Number(form.get('day_of_month')) : null,
        is_active: true,
      });
      setStatus('Regra recorrente criada. Recarregue a página.');
      e.currentTarget.reset();
    } catch {
      setStatus('Falha ao criar regra recorrente.');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
      <h2 style={{ margin: 0 }}>Nova recorrência</h2>
      <input name="description" placeholder="Descrição" required style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <input name="amount" type="number" step="0.01" placeholder="Valor" required style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <select name="type" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }}>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>
      <select name="frequency" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }}>
        <option value="monthly">Mensal</option>
        <option value="weekly">Semanal</option>
      </select>
      <input name="day_of_month" type="number" placeholder="Dia do mês" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <input name="account_id" placeholder="ID da conta" required style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <input name="category_id" placeholder="ID da categoria (opcional)" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 0, borderRadius: 12, padding: '14px 18px', fontWeight: 700 }}>Criar recorrência</button>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
