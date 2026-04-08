"use client";

import { useEffect, useState } from 'react';
import { apiPost, apiPut } from '@/lib/api';

type CategoryFormProps = {
  companyId: number | null;
  onCreated?: () => void;
  editingCategory?: any | null;
  onCancelEdit?: () => void;
};

const fieldStyle = { padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', background: '#fcfcfd', fontSize: 14 } as const;

function humanizeError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  if (!message) return fallback;
  if (message === 'session_expired') return 'Sua sessão expirou. Faça login novamente.';
  if (message === 'category_not_found') return 'Categoria não encontrada.';
  return `Falha: ${message}`;
}

export function CategoryForm({ companyId, onCreated, editingCategory, onCancelEdit }: CategoryFormProps) {
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ name: '', group_type: 'operacional', direction: 'ambos' });

  useEffect(() => {
    if (editingCategory) {
      setForm({
        name: editingCategory.name || '',
        group_type: editingCategory.group_type || 'operacional',
        direction: editingCategory.direction || 'ambos',
      });
      setStatus('');
    } else {
      setForm({ name: '', group_type: 'operacional', direction: 'ambos' });
    }
  }, [editingCategory]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!companyId) {
      setStatus('Faça login para criar categoria.');
      return;
    }
    try {
      if (editingCategory) {
        await apiPut(`/categories/${editingCategory.id}`, {
          name: form.name,
          group_type: form.group_type,
          direction: form.direction,
          is_active: true,
        });
        setStatus('Categoria atualizada com sucesso.');
      } else {
        await apiPost('/categories', {
          company_id: companyId,
          name: form.name,
          group_type: form.group_type,
          direction: form.direction,
        });
        setStatus('Categoria criada com sucesso.');
      }
      setForm({ name: '', group_type: 'operacional', direction: 'ambos' });
      onCreated?.();
      onCancelEdit?.();
    } catch (error) {
      setStatus(humanizeError(error, editingCategory ? 'Falha ao atualizar categoria.' : 'Falha ao criar categoria.'));
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 24 }}>{editingCategory ? 'Editar categoria' : 'Nova categoria'}</h2>
        <p style={{ margin: '8px 0 0', color: '#667085', fontSize: 14 }}>Estrutura que sustenta DFC, agrupamento e leitura financeira.</p>
      </div>
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome da categoria" required style={fieldStyle} />
      <select value={form.group_type} onChange={(e) => setForm({ ...form, group_type: e.target.value })} style={fieldStyle}>
        <option value="operacional">Operacional</option>
        <option value="investimento">Investimento</option>
        <option value="financiamento">Financiamento</option>
      </select>
      <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })} style={fieldStyle}>
        <option value="ambos">Ambos</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="submit" style={{ background: 'linear-gradient(135deg, #111827 0%, #1d2939 100%)', color: '#fff', border: 0, borderRadius: 14, padding: '14px 18px', fontWeight: 800, boxShadow: '0 12px 24px rgba(17,24,39,0.18)' }} disabled={!companyId}>{editingCategory ? 'Salvar categoria' : 'Criar categoria'}</button>
        {editingCategory ? <button type="button" onClick={onCancelEdit} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '14px 18px', fontWeight: 800 }}>Cancelar</button> : null}
      </div>
      {status ? <div style={{ color: '#475467', fontSize: 14 }}>{status}</div> : null}
    </form>
  );
}
