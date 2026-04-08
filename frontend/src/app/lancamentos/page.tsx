"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

export default function LancamentosPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [launches, setLaunches] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any | null>(null);
  const [status, setStatus] = useState('');

  function loadAll() {
    if (!companyId) {
      setLaunches([]);
      setAccounts([]);
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      apiGet(`/companies/${companyId}/launches`).catch(() => []),
      apiGet(`/companies/${companyId}/accounts`).catch(() => []),
      apiGet(`/companies/${companyId}/categories`).catch(() => []),
    ]).then(([launchesData, accountsData, categoriesData]) => {
      setLaunches(launchesData);
      setAccounts(accountsData);
      setCategories(categoriesData);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadAll();
  }, [companyId]);

  const availableCategories = useMemo(() => {
    if (!form) return categories;
    return categories.filter((category: any) => category.direction === 'ambos' || category.direction === form.type);
  }, [categories, form]);

  function startEdit(launch: any) {
    setEditingId(launch.id);
    setForm({
      account_id: String(launch.account_id),
      category_id: launch.category_id ? String(launch.category_id) : '',
      launch_date: launch.launch_date,
      description: launch.description,
      amount: String(launch.amount),
      type: launch.type,
      subcategory: launch.subcategory || '',
      counterparty: launch.counterparty || '',
      notes: launch.notes || '',
      attachment_url: launch.attachment_url || '',
      status: launch.status || 'confirmado',
    });
    setStatus('');
  }

  async function saveEdit() {
    if (!editingId || !form) return;
    try {
      await apiPut(`/launches/${editingId}`, {
        account_id: Number(form.account_id),
        category_id: form.category_id ? Number(form.category_id) : null,
        launch_date: form.launch_date,
        description: form.description,
        amount: Number(form.amount),
        type: form.type,
        subcategory: form.subcategory || null,
        counterparty: form.counterparty || null,
        notes: form.notes || null,
        attachment_url: form.attachment_url || null,
        status: form.status || 'confirmado',
      });
      setEditingId(null);
      setForm(null);
      setStatus('Lançamento atualizado com sucesso.');
      loadAll();
    } catch {
      setStatus('Falha ao atualizar lançamento.');
    }
  }

  async function cancelLaunch(id: number) {
    try {
      await apiPost(`/launches/${id}/cancel`, {});
      if (editingId === id) {
        setEditingId(null);
        setForm(null);
      }
      setStatus('Lançamento baixado/cancelado com sucesso.');
      loadAll();
    } catch {
      setStatus('Falha ao baixar lançamento.');
    }
  }

  return (
    <AppShell
      title="Lançamentos"
      subtitle="Fluxo operacional de entradas e saídas com edição, baixa lógica, classificação e anexos."
      actions={<Link href="/lancamentos/novo" style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Novo lançamento</Link>}
    >
      {status ? <div style={{ marginBottom: 16, background: '#fff', border: '1px solid #d0d5dd', borderRadius: 14, padding: 16, color: '#475467' }}>{status}</div> : null}
      {sessionLoading || loading ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24, color: '#475467' }}>Carregando lançamentos...</div>
      ) : !companyId ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>Faça login para carregar os lançamentos.</div>
      ) : launches.length ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {launches.map((launch: any) => {
            const isEditing = editingId === launch.id;
            return (
              <div key={launch.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, opacity: launch.status === 'cancelado' ? 0.72 : 1 }}>
                {isEditing && form ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                      <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
                      <input value={form.launch_date} onChange={(e) => setForm({ ...form, launch_date: e.target.value })} type="date" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
                      <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" step="0.01" placeholder="Valor" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
                      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, category_id: '' })} style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }}>
                        <option value="entrada">Entrada</option>
                        <option value="saida">Saída</option>
                      </select>
                      <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }}>
                        {accounts.map((account: any) => <option key={account.id} value={account.id}>{account.name}</option>)}
                      </select>
                      <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }}>
                        <option value="">Sem categoria / sugerir</option>
                        {availableCategories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}
                      </select>
                    </div>
                    <input value={form.counterparty} onChange={(e) => setForm({ ...form, counterparty: e.target.value })} placeholder="Contraparte" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
                    <input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="Subcategoria" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
                    <input value={form.attachment_url} onChange={(e) => setForm({ ...form, attachment_url: e.target.value })} placeholder="URL do comprovante" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observações" style={{ minHeight: 100, padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button onClick={saveEdit} style={{ background: '#0f172a', color: '#fff', border: 0, borderRadius: 12, padding: '12px 16px', fontWeight: 700 }}>Salvar</button>
                      <button onClick={() => { setEditingId(null); setForm(null); }} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '12px 16px', fontWeight: 700 }}>Cancelar edição</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 20 }}>{launch.description}</div>
                      <div style={{ marginTop: 8, color: '#667085' }}>{launch.launch_date} · {launch.category_name ?? 'Sem categoria'}</div>
                      <div style={{ marginTop: 8, color: '#667085', fontSize: 14 }}>Status: {launch.status}</div>
                      {launch.attachment_url ? <a href={`${launch.attachment_url}`} target="_blank" style={{ marginTop: 8, color: '#0f172a', fontSize: 14, display: 'inline-block' }}>Abrir comprovante</a> : null}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>R$ {Number(launch.amount).toLocaleString('pt-BR')}</div>
                      <div style={{ marginTop: 8, color: '#667085' }}>{launch.type}</div>
                      <div style={{ marginTop: 8, color: '#667085', fontSize: 14 }}>{launch.classification_status}</div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12, flexWrap: 'wrap' }}>
                        <button onClick={() => startEdit(launch)} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '10px 12px', fontWeight: 700 }}>Editar</button>
                        {launch.status !== 'cancelado' ? <button onClick={() => cancelLaunch(launch.id)} style={{ background: '#fff7ed', color: '#b54708', border: '1px solid #fed7aa', borderRadius: 12, padding: '10px 12px', fontWeight: 700 }}>Baixar</button> : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>
          <div style={{ fontWeight: 700 }}>Ainda não há lançamentos registrados.</div>
          <div style={{ marginTop: 8, color: '#475467' }}>Cadastre a primeira entrada ou saída para começar a formar saldo, DFC e projeção.</div>
        </div>
      )}
    </AppShell>
  );
}
