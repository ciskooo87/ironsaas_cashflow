"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet } from '@/lib/api';
import { CategoryForm } from '@/components/CategoryForm';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

function humanizeError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';
  if (!message) return fallback;
  if (message === 'session_expired') return 'Sua sessão expirou. Faça login novamente.';
  if (message === 'category_not_found') return 'Categoria não encontrada.';
  return `Falha: ${message}`;
}

export default function CategoriasPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const loadCategories = useCallback(() => {
    if (!companyId) {
      setCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiGet(`/companies/${companyId}/categories`).then(setCategories).catch(() => setCategories([])).finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function deleteCategory(id: number) {
    try {
      await apiDelete(`/categories/${id}`);
      if (editingCategory?.id === id) setEditingCategory(null);
      setStatusMessage('Categoria apagada com sucesso.');
      loadCategories();
    } catch (error) {
      setStatusMessage(humanizeError(error, 'Falha ao apagar categoria.'));
    }
  }

  return (
    <AppShell title="Categorias" subtitle="Base de classificação financeira para sustentar DFC, leitura operacional e automações futuras.">
      {statusMessage ? <div style={{ marginBottom: 16, background: '#fff', border: '1px solid #d0d5dd', borderRadius: 16, padding: 16, color: '#475467' }}>{statusMessage}</div> : null}
      {sessionLoading || loading ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, color: '#475467', boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>Carregando categorias...</div>
      ) : !companyId ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24 }}>Faça login para carregar as categorias.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, overflow: 'hidden', boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
            <div style={{ padding: 20, borderBottom: '1px solid #eaecf0', fontWeight: 800, color: '#101828' }}>Estrutura de categorias</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: 14, color: '#98A2B3', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Nome</th>
                  <th style={{ textAlign: 'left', padding: 14, color: '#98A2B3', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Grupo</th>
                  <th style={{ textAlign: 'left', padding: 14, color: '#98A2B3', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Direção</th>
                  <th style={{ textAlign: 'right', padding: 14, color: '#98A2B3', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.length ? categories.map((category: any) => (
                  <tr key={category.id}>
                    <td style={{ padding: 14, borderBottom: '1px solid #f2f4f7', fontWeight: 700 }}>{category.name}</td>
                    <td style={{ padding: 14, borderBottom: '1px solid #f2f4f7', color: '#475467' }}>{category.group_type}</td>
                    <td style={{ padding: 14, borderBottom: '1px solid #f2f4f7', color: '#475467' }}>{category.direction}</td>
                    <td style={{ padding: 14, borderBottom: '1px solid #f2f4f7', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap' }}>
                        <button onClick={() => { setEditingCategory(category); setStatusMessage(''); }} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '10px 12px', fontWeight: 800 }}>Editar</button>
                        <button onClick={() => deleteCategory(category.id)} style={{ background: '#fff1f3', color: '#b42318', border: '1px solid #fecdca', borderRadius: 12, padding: '10px 12px', fontWeight: 800 }}>Apagar</button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ padding: 18, color: '#475467' }}>Nenhuma categoria cadastrada ainda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <CategoryForm onCreated={loadCategories} companyId={companyId} editingCategory={editingCategory} onCancelEdit={() => setEditingCategory(null)} />
        </div>
      )}
    </AppShell>
  );
}
