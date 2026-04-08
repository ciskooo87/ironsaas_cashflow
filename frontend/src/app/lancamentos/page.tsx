"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';

export default function LancamentosPage() {
  const [launches, setLaunches] = useState<any[]>([]);

  useEffect(() => {
    apiGet('/companies/1/launches').then(setLaunches).catch(() => setLaunches([]));
  }, []);

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h1>Lançamentos</h1>
          <p>Fluxo operacional inicial de entradas e saídas.</p>
        </div>
        <Link href="/lancamentos/novo" style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '14px 18px', fontWeight: 700, textDecoration: 'none' }}>Novo lançamento</Link>
      </div>
      <div style={{ display: 'grid', gap: 16, marginTop: 16 }}>
        {launches.map((launch: any) => (
          <div key={launch.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20 }}>{launch.description}</div>
                <div style={{ marginTop: 8, color: '#667085' }}>{launch.launch_date} · {launch.category_name ?? 'Sem categoria'}</div>
                {launch.attachment_url ? <div style={{ marginTop: 8, color: '#667085', fontSize: 14 }}>Com comprovante anexado</div> : null}
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
    </main>
  );
}
