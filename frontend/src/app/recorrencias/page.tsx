"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { RecurringRuleForm } from '@/components/RecurringRuleForm';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

export default function RecorrenciasPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRules = useCallback(() => {
    if (!companyId) {
      setRules([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiGet(`/companies/${companyId}/recurring-rules`).then(setRules).catch(() => setRules([])).finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  return (
    <AppShell title="Recorrências" subtitle="Fluxos previsíveis para sustentar projeção de caixa e rotina operacional.">
      {sessionLoading || loading ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24, color: '#475467' }}>Carregando recorrências...</div>
      ) : !companyId ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>Faça login para carregar as recorrências.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 16 }}>
            {rules.length ? rules.map((rule: any) => (
              <div key={rule.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{rule.description}</div>
                <div style={{ marginTop: 8, color: '#667085' }}>{rule.frequency} · {rule.type}</div>
                <div style={{ marginTop: 12, fontWeight: 700 }}>R$ {Number(rule.amount).toLocaleString('pt-BR')}</div>
              </div>
            )) : <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, color: '#475467' }}>Nenhuma recorrência cadastrada ainda.</div>}
          </div>
          <RecurringRuleForm onCreated={loadRules} companyId={companyId} />
        </div>
      )}
    </AppShell>
  );
}
