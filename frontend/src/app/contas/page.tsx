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
    <AppShell title="Contas" subtitle="Gestão das contas de caixa e banco da empresa autenticada, com ajuste de saldo inicial.">
      {sessionLoading || loading ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24, color: '#475467' }}>Carregando contas...</div>
      ) : !companyId ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>Faça login para carregar as contas.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: 16 }}>
            {accounts.length ? accounts.map((account: any) => (
              <div key={account.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{account.name}</div>
                    <div style={{ color: '#667085', marginTop: 8 }}>{account.type}{account.bank_name ? ` · ${account.bank_name}` : ''}</div>
                    <div style={{ marginTop: 12, fontWeight: 700 }}>Saldo atual: R$ {Number(account.current_balance).toLocaleString('pt-BR')}</div>
                    <div style={{ marginTop: 6, color: '#667085', fontSize: 14 }}>Saldo inicial: R$ {Number(account.initial_balance).toLocaleString('pt-BR')}</div>
                  </div>
                  <button onClick={() => setEditingAccount(account)} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '10px 12px', fontWeight: 700 }}>Editar saldo</button>
                </div>
              </div>
            )) : <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, color: '#475467' }}>Nenhuma conta cadastrada ainda.</div>}
          </div>
          <AccountForm onCreated={loadAccounts} companyId={companyId} editingAccount={editingAccount} onCancelEdit={() => setEditingAccount(null)} />
        </div>
      )}
    </AppShell>
  );
}
