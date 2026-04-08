"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

const fieldStyle = { padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', background: '#fcfcfd', fontSize: 14 } as const;

export default function LancamentosPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [launches, setLaunches] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '', account_id: '', category_id: '', date_from: '', date_to: '', q: '', order: 'date_desc' });

  function buildLaunchesPath() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, String(value)); });
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return `/companies/${companyId}/launches${suffix}`;
  }

  function loadAll() {
    if (!companyId) { setLaunches([]); setAccounts([]); setCategories([]); setLoading(false); return; }
    setLoading(true);
    Promise.all([
      apiGet(buildLaunchesPath()).catch(() => []),
      apiGet(`/companies/${companyId}/accounts`).catch(() => []),
      apiGet(`/companies/${companyId}/categories`).catch(() => []),
    ]).then(([launchesData, accountsData, categoriesData]) => {
      setLaunches(launchesData); setAccounts(accountsData); setCategories(categoriesData); setLoading(false);
    });
  }

  useEffect(() => { loadAll(); }, [companyId, filters]);

  const availableCategories = useMemo(() => !form ? categories : categories.filter((category: any) => category.direction === 'ambos' || category.direction === form.type), [categories, form]);
  const totals = useMemo(() => ({
    entries: launches.filter((launch: any) => launch.type === 'entrada' && launch.status !== 'cancelado').reduce((acc: number, launch: any) => acc + Number(launch.amount), 0),
    exits: launches.filter((launch: any) => launch.type === 'saida' && launch.status !== 'cancelado').reduce((acc: number, launch: any) => acc + Number(launch.amount), 0),
  }), [launches]);

  function startEdit(launch: any) {
    setEditingId(launch.id);
    setForm({ account_id: String(launch.account_id), category_id: launch.category_id ? String(launch.category_id) : '', launch_date: launch.launch_date, description: launch.description, amount: String(launch.amount), type: launch.type, subcategory: launch.subcategory || '', counterparty: launch.counterparty || '', notes: launch.notes || '', attachment_url: launch.attachment_url || '', status: launch.status || 'confirmado' });
    setStatusMessage('');
  }

  async function saveEdit() {
    if (!editingId || !form) return;
    try {
      await apiPut(`/launches/${editingId}`, { account_id: Number(form.account_id), category_id: form.category_id ? Number(form.category_id) : null, launch_date: form.launch_date, description: form.description, amount: Number(form.amount), type: form.type, subcategory: form.subcategory || null, counterparty: form.counterparty || null, notes: form.notes || null, attachment_url: form.attachment_url || null, status: form.status || 'confirmado' });
      setEditingId(null); setForm(null); setStatusMessage('Lançamento atualizado com sucesso.'); loadAll();
    } catch { setStatusMessage('Falha ao atualizar lançamento.'); }
  }

  async function cancelLaunch(id: number) {
    try {
      await apiPost(`/launches/${id}/cancel`, {});
      if (editingId === id) { setEditingId(null); setForm(null); }
      setStatusMessage('Lançamento baixado/cancelado com sucesso.'); loadAll();
    } catch { setStatusMessage('Falha ao baixar lançamento.'); }
  }

  return (
    <AppShell title="Lançamentos" subtitle="Fluxo operacional refinado para acompanhar entradas e saídas com filtros, edição e baixa lógica." actions={<Link href="/lancamentos/novo" style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', borderRadius: 14, padding: '12px 16px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }}>Novo lançamento</Link>}>
      {statusMessage ? <div style={{ marginBottom: 16, background: '#fff', border: '1px solid #d0d5dd', borderRadius: 16, padding: 16, color: '#475467' }}>{statusMessage}</div> : null}

      <div style={{ display: 'grid', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, display: 'grid', gap: 16, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Filtros e ordenação</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Buscar descrição" style={fieldStyle} />
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} style={fieldStyle}><option value="">Todos os status</option><option value="confirmado">Confirmado</option><option value="cancelado">Cancelado</option></select>
            <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} style={fieldStyle}><option value="">Todos os tipos</option><option value="entrada">Entrada</option><option value="saida">Saída</option></select>
            <select value={filters.order} onChange={(e) => setFilters({ ...filters, order: e.target.value })} style={fieldStyle}><option value="date_desc">Mais recentes</option><option value="date_asc">Mais antigos</option><option value="amount_desc">Maior valor</option><option value="amount_asc">Menor valor</option></select>
            <select value={filters.account_id} onChange={(e) => setFilters({ ...filters, account_id: e.target.value })} style={fieldStyle}><option value="">Todas as contas</option>{accounts.map((account: any) => <option key={account.id} value={account.id}>{account.name}</option>)}</select>
            <select value={filters.category_id} onChange={(e) => setFilters({ ...filters, category_id: e.target.value })} style={fieldStyle}><option value="">Todas as categorias</option>{categories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
            <input value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} type="date" style={fieldStyle} />
            <input value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} type="date" style={fieldStyle} />
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', color: '#475467', fontSize: 14 }}>
            <span><strong>{launches.length}</strong> lançamentos exibidos</span>
            <span>Entradas filtradas: <strong>R$ {totals.entries.toLocaleString('pt-BR')}</strong></span>
            <span>Saídas filtradas: <strong>R$ {totals.exits.toLocaleString('pt-BR')}</strong></span>
            <button onClick={() => setFilters({ status: '', type: '', account_id: '', category_id: '', date_from: '', date_to: '', q: '', order: 'date_desc' })} style={{ background: 'transparent', border: 0, color: '#0f172a', fontWeight: 800, cursor: 'pointer' }}>Limpar filtros</button>
          </div>
        </div>
      </div>

      {sessionLoading || loading ? <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, color: '#475467' }}>Carregando lançamentos...</div> : !companyId ? <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24 }}>Faça login para carregar os lançamentos.</div> : launches.length ? (
        <div style={{ display: 'grid', gap: 18 }}>
          {launches.map((launch: any) => {
            const isEditing = editingId === launch.id;
            return (
              <div key={launch.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, opacity: launch.status === 'cancelado' ? 0.72 : 1, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
                {isEditing && form ? (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
                      <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Descrição" style={fieldStyle} />
                      <input value={form.launch_date} onChange={(e) => setForm({ ...form, launch_date: e.target.value })} type="date" style={fieldStyle} />
                      <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" step="0.01" placeholder="Valor" style={fieldStyle} />
                      <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, category_id: '' })} style={fieldStyle}><option value="entrada">Entrada</option><option value="saida">Saída</option></select>
                      <select value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} style={fieldStyle}>{accounts.map((account: any) => <option key={account.id} value={account.id}>{account.name}</option>)}</select>
                      <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} style={fieldStyle}><option value="">Sem categoria / sugerir</option>{availableCategories.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
                    </div>
                    <input value={form.counterparty} onChange={(e) => setForm({ ...form, counterparty: e.target.value })} placeholder="Contraparte" style={fieldStyle} />
                    <input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="Subcategoria" style={fieldStyle} />
                    <input value={form.attachment_url} onChange={(e) => setForm({ ...form, attachment_url: e.target.value })} placeholder="URL do comprovante" style={fieldStyle} />
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Observações" style={{ ...fieldStyle, minHeight: 110 }} />
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button onClick={saveEdit} style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', border: 0, borderRadius: 14, padding: '14px 18px', fontWeight: 800 }}>Salvar</button>
                      <button onClick={() => { setEditingId(null); setForm(null); }} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '14px 18px', fontWeight: 800 }}>Cancelar edição</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 24 }}>{launch.description}</div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ background: launch.type === 'entrada' ? '#ecfdf3' : '#fef3f2', color: launch.type === 'entrada' ? '#027A48' : '#B42318', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>{launch.type}</span>
                        <span style={{ background: '#f8fafc', color: '#475467', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>{launch.category_name ?? 'Sem categoria'}</span>
                        <span style={{ background: launch.status === 'cancelado' ? '#fff7ed' : '#eff4ff', color: launch.status === 'cancelado' ? '#B54708' : '#004EEB', borderRadius: 999, padding: '6px 10px', fontSize: 12, fontWeight: 800 }}>{launch.status}</span>
                      </div>
                      <div style={{ marginTop: 10, color: '#667085', fontSize: 14 }}>{launch.launch_date}</div>
                      <div style={{ marginTop: 6, color: '#98A2B3', fontSize: 12 }}>Criado: {launch.created_by_name ?? '—'} · Alterado: {launch.updated_by_name ?? '—'}</div>
                      {launch.attachment_url ? <a href={`${launch.attachment_url}`} target="_blank" style={{ marginTop: 10, color: '#0f172a', fontSize: 14, display: 'inline-block', fontWeight: 700 }}>Abrir comprovante</a> : null}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 24 }}>R$ {Number(launch.amount).toLocaleString('pt-BR')}</div>
                      <div style={{ marginTop: 8, color: '#667085', fontSize: 14 }}>{launch.classification_status}</div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14, flexWrap: 'wrap' }}>
                        <button onClick={() => startEdit(launch)} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '12px 14px', fontWeight: 800 }}>Editar</button>
                        {launch.status !== 'cancelado' ? <button onClick={() => cancelLaunch(launch.id)} style={{ background: '#fff7ed', color: '#b54708', border: '1px solid #fed7aa', borderRadius: 14, padding: '12px 14px', fontWeight: 800 }}>Baixar</button> : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24 }}><div style={{ fontWeight: 800 }}>Nenhum lançamento encontrado com os filtros atuais.</div><div style={{ marginTop: 8, color: '#475467' }}>Ajuste período, conta, categoria, tipo ou busca textual para ampliar a leitura.</div></div>}
    </AppShell>
  );
}
