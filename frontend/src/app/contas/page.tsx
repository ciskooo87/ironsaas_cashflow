"use client";

import { useCallback, useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { AccountForm } from '@/components/AccountForm';

export default function ContasPage() {
  const [accounts, setAccounts] = useState<any[]>([]);

  const loadAccounts = useCallback(() => {
    apiGet('/companies/1/accounts').then(setAccounts).catch(() => setAccounts([]));
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <h1>Contas</h1>
      <p>Gestão inicial das contas de caixa e banco.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 16 }}>
          {accounts.map((account: any) => (
            <div key={account.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{account.name}</div>
              <div style={{ color: '#667085', marginTop: 8 }}>{account.type}</div>
              <div style={{ marginTop: 12, fontWeight: 700 }}>R$ {Number(account.current_balance).toLocaleString('pt-BR')}</div>
            </div>
          ))}
        </div>
        <AccountForm onCreated={loadAccounts} />
      </div>
    </main>
  );
}
