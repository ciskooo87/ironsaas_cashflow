"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE } from "@/lib/api";
import { getToken } from "@/lib/auth";

export function LaunchForm() {
  const [status, setStatus] = useState("");
  const router = useRouter();

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
    setTimeout(() => router.push('/lancamentos?refresh=1'), 700);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, background: '#fff', padding: 24, borderRadius: 20, border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        <input name="launch_date" placeholder="Data" type="date" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required />
        <input name="description" placeholder="Descrição" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required />
        <input name="amount" placeholder="Valor" type="number" step="0.01" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required />
        <select name="type" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required><option value="entrada">Entrada</option><option value="saida">Saída</option></select>
        <input name="category_id" placeholder="ID da categoria (opcional)" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
        <input name="subcategory" placeholder="Subcategoria" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
        <input name="account_id" placeholder="ID da conta" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} required />
        <input name="file" type="file" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      </div>
      <input name="counterparty" placeholder="Contraparte" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <textarea name="notes" placeholder="Observações" style={{ minHeight: 120, padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
      <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 0, borderRadius: 12, padding: '14px 18px', fontWeight: 700, width: 220 }}>Salvar lançamento</button>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
