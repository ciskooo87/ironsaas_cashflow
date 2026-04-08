"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPut } from '@/lib/api';
import { RecurringRuleForm } from '@/components/RecurringRuleForm';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

const fieldStyle = { padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', background: '#fcfcfd', fontSize: 14 } as const;

export default function RecorrenciasPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [rules, setRules] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [form, setForm] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const loadRules = useCallback(() => {
    if (!companyId) {
      setRules([]); setAccounts([]); setCategories([]); setLoading(false); return;
    }
    setLoading(true);
    Promise.all([
      apiGet(`/companies/${companyId}/recurring-rules`).catch(() => []),
      apiGet(`/companies/${companyId}/accounts`).catch(() => []),
      apiGet(`/companies/${companyId}/categories`).catch(() => []),
    ]).then(([rulesData, accountsData, categoriesData]) => {
      setRules(rulesData); setAccounts(accountsData); setCategories(categoriesData); setLoading(false);
    });
  }, [companyId]);

  useEffect(() => { loadRules(); }, [loadRules]);

  function startEdit(rule: any) {
    setEditingRuleId(rule.id);
    setForm({ description: rule.description, amount: String(rule.amount), type: rule.type, frequency: rule.frequency, day_of_month: rule.day_of_month ? String(rule.day_of_month) : '', account_id: String(rule.account_id), category_id: rule.category_id ? String(rule.category_id) : '', is_active: rule.is_active });
    setStatusMessage('');
  }

  async function saveEdit() {
    if (!editingRuleId || !form) return;
    try {
      await apiPut(`/recurring-rules/${editingRuleId}`, { account_id: Number(form.account_id), category_id: form.category_id ? Number(form.category_id) : null, description: form.description, amount: Number(form.amount), type: form.type, frequency: form.frequency, day_of_month: form.day_of_month ? Number(form.day_of_month) : null, is_active: Boolean(form.is_active) });
      setEditingRuleId(null); setForm(null); setStatusMessage('Recorrência atualizada com sucesso.'); loadRules();
    } catch { setStatusMessage('Falha ao atualizar recorrência.'); }
  }

  async function deleteRule(id: number) {
    try {
      await apiDelete(`/recurring-rules/${id}`);
      if (editingRuleId === id) { setEditingRuleId(null); setForm(null); }
      setStatusMessage('Recorrência apagada com sucesso.'); loadRules();
    } catch { setStatusMessage('Falha ao apagar recorrência.'); }
  }

  return (
    <AppShell title="Recorrências" subtitle="Fluxos previsíveis para sustentar projeção, previsibilidade financeira e rotina operacional.">
      {statusMessage ? <div style={{ marginBottom: 16, background: '#fff', border: '1px solid #d0d5dd', borderRadius: 16, padding: 16, color: '#475467' }}>{statusMessage}</div> : null}
      {sessionLoading || loading ? <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, color: '#475467' }}>Carregando recorrências...</div> : !companyId ? <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24 }}>Faça login para carregar as recorrências.</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            {rules.length ? rules.map((rule: any) => {
              const isEditing = editingRuleId === rule.id;
              return (
                <div key={rule.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
                  {isEditing && form ? (
                    <div style={{ display: 'grid', gap: 12 }}>
                      <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição" style={fieldStyle} />
                      <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" step="0.01" placeholder="Valor" style={fieldStyle} />
                      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, category_id: '' })} style={fieldStyle}><option value="entrada">Entrada</option><option value="saida">Saída</option></select>
                      <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} style={fieldStyle}><option value="monthly">Mensal</option><option value="weekly">Semanal</option></select>
                      <input value={form.day_of_month} onChange={(e) => setForm({ ...form, day_of_month: e.target.value })} type="number" placeholder="Dia do mês" style={fieldStyle} />
                      <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} style={fieldStyle}>{accounts.map((account: any) => <option key={account.id} value={account.id}>{account.name}</option>)}</select>
                      <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} style={fieldStyle}><option value="">Sem categoria</option>{categories.filter((category: any) => category.direction === 'ambos' || category.direction === form.type).map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button onClick={saveEdit} style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', border: 0, borderRadius: 14, padding: '14px 18px', fontWeight: 800 }}>Salvar</button>
                        <button onClick={() => { setEditingRuleId(null); setForm(null); }} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '14px 18px', fontWeight: 800 }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 800, fontSize: 24 }}>{rule.description}</div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ background: '#eff4ff', color: '#004EEB', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>{rule.frequency}</span>
                        <span style={{ background: rule.type === 'entrada' ? '#ecfdf3' : '#fef3f2', color: rule.type === 'entrada' ? '#027A48' : '#B42318', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>{rule.type}</span>
                      </div>
                      <div style={{ marginTop: 16, fontWeight: 800, fontSize: 22 }}>R$ {Number(rule.amount).toLocaleString('pt-BR')}</div>
                      <div style={{ marginTop: 6, color: '#98A2B3', fontSize: 12 }}>Criado: {rule.created_by_name ?? '—'} · Alterado: {rule.updated_by_name ?? '—'}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                        <button onClick={() => startEdit(rule)} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '12px 14px', fontWeight: 800 }}>Editar</button>
                        <button onClick={() => deleteRule(rule.id)} style={{ background: '#fff1f3', color: '#b42318', border: '1px solid #fecdca', borderRadius: 14, padding: '12px 14px', fontWeight: 800 }}>Apagar</button>
                      </div>
                    </>
                  )}
                </div>
              );
            }) : <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, color: '#475467' }}>Nenhuma recorrência cadastrada ainda.</div>}
          </div>
          <RecurringRuleForm onCreated={loadRules} companyId={companyId} />
        </div>
      )}
    </AppShell>
  );
}
