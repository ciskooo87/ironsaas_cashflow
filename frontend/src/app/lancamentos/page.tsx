"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

export default function LancamentosPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [launches, setLaunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLaunches([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    apiGet(`/companies/${companyId}/launches`).then(setLaunches).catch(() => setLaunches([])).finally(() => setLoading(false));
  }, [companyId]);

  return (
    <AppShell
      title="Lançamentos"
      subtitle="Fluxo operacional de entradas e saídas com classificação, anexos e leitura mais limpa."
      actions={<Link href="/lancamentos/novo" style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Novo lançamento</Link>}
    >
      {sessionLoading || loading ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24, color: '#475467' }}>Carregando lançamentos...</div>
      ) : !companyId ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>Faça login para carregar os lançamentos.</div>
      ) : launches.length ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {launches.map((launch: any) => (
            <div key={launch.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 20 }}>{launch.description}</div>
                  <div style={{ marginTop: 8, color: '#667085' }}>{launch.launch_date} · {launch.category_name ?? 'Sem categoria'}</div>
                  {launch.attachment_url ? <a href={`${launch.attachment_url}`} target="_blank" style={{ marginTop: 8, color: '#0f172a', fontSize: 14, display: 'inline-block' }}>Abrir comprovante</a> : null}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>R$ {Number(launch.amount).toLocaleString('pt-BR')}</div>
                  <div style={{ marginTop: 8, color: '#667085' }}>{launch.type}</div>
                  <div style={{ marginTop: 8, color: '#667085', fontSize: 14 }}>{launch.classification_status}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>
          <div style={{ fontWeight: 700 }}>Ainda não há lançamentos registrados.</div>
          <div style={{ marginTop: 8, color: '#475467' }}>Cadastre a primeira entrada ou saída para começar a formar saldo, DFC e projeção.</div>
        </div>
      )}
    </AppShell>
  );
}
