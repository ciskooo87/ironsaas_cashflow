"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { AccountForm } from '@/components/AccountForm';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

export default function ContasPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);

  const loadAccounts = useCallback(() => {
    if (!companyId) {
      setAccounts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiGet(`/companies/${companyId}/accounts`).then(setAccounts).catch(() => setAccounts([])).finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return (
    <AppShell title="Contas" subtitle="Gestão das contas de caixa e banco com leitura mais clara de saldo e contexto operacional.">
      {sessionLoading || loading ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, color: '#475467', boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>Carregando contas...</div>
      ) : !companyId ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24 }}>Faça login para carregar as contas.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 18 }}>
            {accounts.length ? accounts.map((account: any) => (
              <div key={account.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#101828' }}>{account.name}</div>
                    <div style={{ color: '#667085', marginTop: 8, fontSize: 14 }}>{account.type}{account.bank_name ? ` · ${account.bank_name}` : ''}</div>
                    <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ background: '#ecfdf3', color: '#027A48', borderRadius: 14, padding: '10px 12px', fontWeight: 800 }}>Saldo atual: R$ {Number(account.current_balance).toLocaleString('pt-BR')}</div>
                      <div style={{ background: '#f8fafc', color: '#475467', borderRadius: 14, padding: '10px 12px', fontWeight: 700 }}>Saldo inicial: R$ {Number(account.initial_balance).toLocaleString('pt-BR')}</div>
                    </div>
                  </div>
                  <button onClick={() => setEditingAccount(account)} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '12px 14px', fontWeight: 800 }}>Editar saldo</button>
                </div>
              </div>
            )) : <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, color: '#475467' }}>Nenhuma conta cadastrada ainda.</div>}
          </div>
          <AccountForm onCreated={loadAccounts} companyId={companyId} editingAccount={editingAccount} onCancelEdit={() => setEditingAccount(null)} />
        </div>
      )}
    </AppShell>
  );
}
