"use client";

import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';

type RecurringRuleFormProps = {
  companyId: number | null;
  onCreated?: () => void;
};

type Account = { id: number; name: string; type: string };
type Category = { id: number; name: string; direction: string };

const fieldStyle = { padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', background: '#fcfcfd', fontSize: 14 } as const;

export function RecurringRuleForm({ companyId, onCreated }: RecurringRuleFormProps) {
  const [status, setStatus] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ruleType, setRuleType] = useState('entrada');

  useEffect(() => {
    if (!companyId) {
      setAccounts([]);
      setCategories([]);
      return;
    }
    apiGet(`/companies/${companyId}/accounts`).then(setAccounts).catch(() => setAccounts([]));
    apiGet(`/companies/${companyId}/categories`).then(setCategories).catch(() => setCategories([]));
  }, [companyId]);

  const availableCategories = useMemo(() => categories.filter((category) => category.direction === 'ambos' || category.direction === ruleType), [categories, ruleType]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!companyId) {
      setStatus('Faça login para criar recorrência.');
      return;
    }
    const form = new FormData(e.currentTarget);
    try {
      await apiPost('/recurring-rules', {
        company_id: companyId,
        account_id: Number(form.get('account_id')),
        category_id: form.get('category_id') ? Number(form.get('category_id')) : null,
        description: form.get('description'),
        amount: Number(form.get('amount')),
        type: form.get('type'),
        frequency: form.get('frequency'),
        day_of_month: form.get('day_of_month') ? Number(form.get('day_of_month')) : null,
        is_active: true,
      });
      setStatus('Regra recorrente criada com sucesso.');
      e.currentTarget.reset();
      setRuleType('entrada');
      onCreated?.();
    } catch {
      setStatus('Falha ao criar regra recorrente.');
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24 }}>Nova recorrência</h2>
        <p style={{ margin: '8px 0 0', color: '#667085', fontSize: 14 }}>Fluxos previsíveis para melhorar projeção e disciplina do caixa.</p>
      </div>
      <input name="description" placeholder="Descrição" required style={fieldStyle} />
      <input name="amount" type="number" step="0.01" placeholder="Valor" required style={fieldStyle} />
      <select name="type" value={ruleType} onChange={(e) => setRuleType(e.target.value)} style={fieldStyle}>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>
      <select name="frequency" style={fieldStyle}>
        <option value="monthly">Mensal</option>
        <option value="weekly">Semanal</option>
      </select>
      <input name="day_of_month" type="number" placeholder="Dia do mês" style={fieldStyle} />
      <select name="account_id" required style={fieldStyle} defaultValue="">
        <option value="" disabled>Selecione a conta</option>
        {accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.type}</option>)}
      </select>
      <select name="category_id" style={fieldStyle} defaultValue="">
        <option value="">Sem categoria</option>
        {availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      {!accounts.length ? <div style={{ color: '#B42318', fontSize: 14 }}>Crie ao menos uma conta antes de cadastrar recorrências.</div> : null}
      {!categories.length ? <div style={{ color: '#B54708', fontSize: 14 }}>Ainda não há categorias cadastradas para apoiar a classificação.</div> : null}
      <button type="submit" style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', border: 0, borderRadius: 14, padding: '14px 18px', fontWeight: 800, boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }} disabled={!companyId || !accounts.length}>Criar recorrência</button>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
