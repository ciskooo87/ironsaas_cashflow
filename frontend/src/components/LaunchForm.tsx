"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { useSessionUser } from '@/lib/session';

type Account = { id: number; name: string; type: string };
type Category = { id: number; name: string; direction: string };

const fieldStyle = { padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', background: '#fcfcfd', fontSize: 14 } as const;

export function LaunchForm() {
  const [status, setStatus] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [launchType, setLaunchType] = useState("entrada");
  const { companyId } = useSessionUser();
  const router = useRouter();

  useEffect(() => {
    if (!companyId) {
      setAccounts([]);
      setCategories([]);
      return;
    }
    apiGet(`/companies/${companyId}/accounts`).then(setAccounts).catch(() => setAccounts([]));
    apiGet(`/companies/${companyId}/categories`).then(setCategories).catch(() => setCategories([]));
  }, [companyId]);

  const availableCategories = useMemo(() => categories.filter((category) => category.direction === 'ambos' || category.direction === launchType), [categories, launchType]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setStatus("Faça login primeiro.");
      return;
    }
    if (!companyId) {
      setStatus("Empresa da sessão não encontrada.");
      return;
    }
    const form = new FormData(e.currentTarget);
    form.set("company_id", String(companyId));
    const res = await fetch(`${API_BASE}/launches/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      setStatus("Falha ao salvar lançamento.");
      return;
    }
    setStatus("Lançamento salvo com sucesso. Redirecionando...");
    e.currentTarget.reset();
    setLaunchType('entrada');
    setTimeout(() => router.push('/lancamentos?refresh=1'), 700);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18, background: '#fff', padding: 28, borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24 }}>Novo lançamento</h2>
        <p style={{ margin: '8px 0 0', color: '#667085', fontSize: 14 }}>Registre entradas e saídas com menos atrito e leitura mais limpa.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        <input name="launch_date" placeholder="Data" type="date" style={fieldStyle} required />
        <input name="description" placeholder="Descrição" style={fieldStyle} required />
        <input name="amount" placeholder="Valor" type="number" step="0.01" style={fieldStyle} required />
        <select name="type" value={launchType} onChange={(e) => setLaunchType(e.target.value)} style={fieldStyle} required>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <select name="category_id" style={fieldStyle} defaultValue="">
          <option value="">Sugerir automaticamente / sem categoria</option>
          {availableCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <input name="subcategory" placeholder="Subcategoria" style={fieldStyle} />
        <select name="account_id" style={fieldStyle} required defaultValue="">
          <option value="" disabled>Selecione a conta</option>
          {accounts.map((account) => <option key={account.id} value={account.id}>{account.name} · {account.type}</option>)}
        </select>
        <input name="file" type="file" style={fieldStyle} />
      </div>
      <input name="counterparty" placeholder="Contraparte" style={fieldStyle} />
      <textarea name="notes" placeholder="Observações" style={{ ...fieldStyle, minHeight: 120 }} />
      {!accounts.length ? <div style={{ color: '#B42318', fontSize: 14 }}>Crie ao menos uma conta antes de registrar lançamentos.</div> : null}
      {!categories.length ? <div style={{ color: '#B54708', fontSize: 14 }}>Sem categorias cadastradas: a classificação automática seguirá como fallback.</div> : null}
      <button type="submit" style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', border: 0, borderRadius: 14, padding: '15px 18px', fontWeight: 800, width: 240, boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }} disabled={!companyId || !accounts.length}>Salvar lançamento</button>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
