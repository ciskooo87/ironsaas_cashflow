"use client";

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { CategoryForm } from '@/components/CategoryForm';

export default function CategoriasPage() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    apiGet('/companies/1/categories').then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Categorias</h1>
      <p>Estrutura base para classificação e DFC automático.</p>
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
            {categories.map((category: any) => (
              <tr key={category.id}>
                <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.name}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.group_type}</td>
                <td style={{ padding: 12, borderBottom: '1px solid #f1f5f9' }}>{category.direction}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <CategoryForm />
      </div>
    </main>
  );
}
