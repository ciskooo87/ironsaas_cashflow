"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [dfc, setDfc] = useState<any | null>(null);

  useEffect(() => {
    apiGet('/companies/1/dashboard').then(setData).catch(() => setData(null));
    apiGet('/companies/1/dfc').then(setDfc).catch(() => setDfc(null));
  }, []);

  const cards = data
    ? [
        ['Saldo consolidado', `R$ ${Number(data.consolidated_balance).toLocaleString('pt-BR')}`],
        ['Entradas', `R$ ${Number(data.inflows).toLocaleString('pt-BR')}`],
        ['Saídas', `R$ ${Number(data.outflows).toLocaleString('pt-BR')}`],
        ['Lançamentos', String(data.total_launches)],
      ]
    : [['Saldo consolidado', '—'], ['Entradas', '—'], ['Saídas', '—'], ['Lançamentos', '—']];

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
        <div>
          <h1>Dashboard</h1>
          <p>Camada executiva inicial do produto.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/lancamentos" style={{ textDecoration: 'none', color: '#0f172a' }}>Lançamentos</Link>
          <Link href="/contas" style={{ textDecoration: 'none', color: '#0f172a' }}>Contas</Link>
          <Link href="/categorias" style={{ textDecoration: 'none', color: '#0f172a' }}>Categorias</Link>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
        {cards.map(([title, value]) => (
          <div key={title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>{title}</div>
            <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 24, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
        <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>DFC inicial</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
          <div><strong>Operacional líquido</strong><div>R$ {dfc ? Number(dfc.operational_inflows - dfc.operational_outflows).toLocaleString('pt-BR') : '—'}</div></div>
          <div><strong>Investimento líquido</strong><div>R$ {dfc ? Number(dfc.investment_inflows - dfc.investment_outflows).toLocaleString('pt-BR') : '—'}</div></div>
          <div><strong>Financiamento líquido</strong><div>R$ {dfc ? Number(dfc.financing_inflows - dfc.financing_outflows).toLocaleString('pt-BR') : '—'}</div></div>
        </div>
        <div style={{ marginTop: 16, fontWeight: 700 }}>Geração líquida de caixa: R$ {dfc ? Number(dfc.net_cash_generation).toLocaleString('pt-BR') : '—'}</div>
      </div>
    </main>
  );
}
