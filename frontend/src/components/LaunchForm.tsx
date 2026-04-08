"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, apiGet } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Account = {
  id: number;
  name: string;
  type: string;
};

type Category = {
  id: number;
  name: string;
  direction: string;
};

export function LaunchForm() {
  const [status, setStatus] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [launchType, setLaunchType] = useState("entrada");
  const router = useRouter();

  useEffect(() => {
    apiGet('/companies/1/accounts').then(setAccounts).catch(() => setAccounts([]));
    apiGet('/companies/1/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  const availableCategories = useMemo(
    () => categories.filter((category) => category.direction === 'ambos' || category.direction === launchType),
    [categories, launchType],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setStatus("Faça login primeiro.");
      return;
    }
    const form = new FormData(e.currentTarget);
    form.set("company_id", "1");
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
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        <input name="launch_date" placeholder="Data" type="date" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required />
        <input name="description" placeholder="Descrição" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required />
        <input name="amount" placeholder="Valor" type="number" step="0.01" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required />
        <select name="type" value={launchType} onChange={(e) => setLaunchType(e.target.value)} style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
        <select name="category_id" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} defaultValue="">
          <option value="">Sugerir automaticamente / sem categoria</option>
          {availableCategories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input name="subcategory" placeholder="Subcategoria" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
        <select name="account_id" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required defaultValue="">
          <option value="" disabled>Selecione a conta</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>{account.name} · {account.type}</option>
          ))}
        </select>
        <input name="file" type="file" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      </div>
      <input name="counterparty" placeholder="Contraparte" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <textarea name="notes" placeholder="Observações" style={{ minHeight: 120, padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      {!accounts.length ? <div style={{ color: '#B42318', fontSize: 14 }}>Crie ao menos uma conta antes de registrar lançamentos.</div> : null}
      {!categories.length ? <div style={{ color: '#B54708', fontSize: 14 }}>Sem categorias cadastradas: a classificação automática seguirá como fallback.</div> : null}
      <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 0, borderRadius: 12, padding: '14px 18px', fontWeight: 700, width: 220 }} disabled={!accounts.length}>Salvar lançamento</button>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
