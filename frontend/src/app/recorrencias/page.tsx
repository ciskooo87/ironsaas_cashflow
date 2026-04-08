"use client";

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { RecurringRuleForm } from '@/components/RecurringRuleForm';

export default function RecorrenciasPage() {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    apiGet('/companies/1/recurring-rules').then(setRules).catch(() => setRules([]));
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Recorrências</h1>
      <p>Fluxos previsíveis para melhorar a projeção de caixa.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {rules.map((rule: any) => (
            <div key={rule.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{rule.description}</div>
              <div style={{ marginTop: 8, color: '#667085' }}>{rule.frequency} · {rule.type}</div>
              <div style={{ marginTop: 12, fontWeight: 700 }}>R$ {Number(rule.amount).toLocaleString('pt-BR')}</div>
            </div>
          ))}
        </div>
        <RecurringRuleForm />
      </div>
    </main>
  );
}
