"use client";

import { useEffect, useState } from 'react';
import { apiPost, apiPut } from '@/lib/api';

type AccountFormProps = {
  companyId: number | null;
  onCreated?: () => void;
  editingAccount?: any | null;
  onCancelEdit?: () => void;
};

export function AccountForm({ companyId, onCreated, editingAccount, onCancelEdit }: AccountFormProps) {
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ name: '', type: '', bank_name: '', initial_balance: '0' });

  useEffect(() => {
    if (editingAccount) {
      setForm({
        name: editingAccount.name || '',
        type: editingAccount.type || '',
        bank_name: editingAccount.bank_name || '',
        initial_balance: String(editingAccount.initial_balance ?? 0),
      });
      setStatus('');
    } else {
      setForm({ name: '', type: '', bank_name: '', initial_balance: '0' });
    }
  }, [editingAccount]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!companyId) {
      setStatus('Faça login para criar ou editar conta.');
      return;
    }
    try {
      if (editingAccount) {
        await apiPut(`/accounts/${editingAccount.id}`, {
          name: form.name,
          type: form.type,
          bank_name: form.bank_name || null,
          initial_balance: Number(form.initial_balance || 0),
          is_active: true,
        });
        setStatus('Conta atualizada com sucesso.');
      } else {
        await apiPost('/accounts', {
          company_id: companyId,
          name: form.name,
          type: form.type,
          bank_name: form.bank_name || null,
          initial_balance: Number(form.initial_balance || 0),
        });
        setStatus('Conta criada com sucesso.');
      }
      setForm({ name: '', type: '', bank_name: '', initial_balance: '0' });
      onCreated?.();
      onCancelEdit?.();
    } catch {
      setStatus(editingAccount ? 'Falha ao atualizar conta.' : 'Falha ao criar conta.');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
      <h2 style={{ margin: 0 }}>{editingAccount ? 'Editar conta' : 'Nova conta'}</h2>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da conta" required style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Tipo (banco, caixa...)" required style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <input value={form.bank_name} onChange={(e) => setForm({ ...form, bank_name: e.target.value })} placeholder="Banco" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <input value={form.initial_balance} onChange={(e) => setForm({ ...form, initial_balance: e.target.value })} name="initial_balance" type="number" step="0.01" placeholder="Saldo inicial" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <div style={{ color: '#475467', fontSize: 13 }}>Ao editar o saldo inicial, o saldo atual da conta é recalculado com base nos lançamentos já registrados.</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 0, borderRadius: 12, padding: '14px 18px', fontWeight: 700 }} disabled={!companyId}>{editingAccount ? 'Salvar conta' : 'Criar conta'}</button>
        {editingAccount ? <button type="button" onClick={onCancelEdit} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '14px 18px', fontWeight: 700 }}>Cancelar</button> : null}
      </div>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
