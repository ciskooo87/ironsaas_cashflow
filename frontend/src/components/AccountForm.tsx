"use client";

import { useState } from 'react';
import { apiPost } from '@/lib/api';

type AccountFormProps = {
  onCreated?: () => void;
};

export function AccountForm({ onCreated }: AccountFormProps) {
  const [status, setStatus] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await apiPost('/accounts', {
        company_id: 1,
        name: form.get('name'),
        type: form.get('type'),
        bank_name: form.get('bank_name') || null,
        initial_balance: Number(form.get('initial_balance') || 0),
      });
      setStatus('Conta criada com sucesso.');
      e.currentTarget.reset();
      onCreated?.();
    } catch {
      setStatus('Falha ao criar conta.');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
      <h2 style={{ margin: 0 }}>Nova conta</h2>
      <input name="name" placeholder="Nome da conta" required style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <input name="type" placeholder="Tipo (banco, caixa...)" required style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <input name="bank_name" placeholder="Banco" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <input name="initial_balance" type="number" step="0.01" placeholder="Saldo inicial" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 0, borderRadius: 12, padding: '14px 18px', fontWeight: 700 }}>Criar conta</button>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
