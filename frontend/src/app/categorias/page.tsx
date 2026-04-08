"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { CategoryForm } from '@/components/CategoryForm';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

export default function CategoriasPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <AppShell title="Categorias" subtitle="Estrutura financeira pronta para classificação e DFC da empresa autenticada.">
      {sessionLoading || loading ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24, color: '#475467' }}>Carregando categorias...</div>
      ) : !companyId ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>Faça login para carregar as categorias.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24, alignItems: 'start' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e2e8f0' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e2e8f0' }}>Grupo</th>
                <th style={{ textAlign: 'left', padding: 12, borderBottom: '1px solid #e2e8f0' }}>Direção</th>
              </tr>
            </thead>
            <tbody>
              {categories.length ? categories.map((category: any) => (
                <tr key={category.id}>
                  <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.name}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.group_type}</td>
                  <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.direction}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: 16, color: '#475467' }}>Nenhuma categoria cadastrada ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
          <CategoryForm onCreated={loadCategories} companyId={companyId} />
        </div>
      )}
    </AppShell>
  );
}
