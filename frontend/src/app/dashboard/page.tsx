"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

export default function DashboardPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [data, setData] = useState<any | null>(null);
  const [dfc, setDfc] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      apiGet(`/companies/${companyId}/dashboard`).catch(() => null),
      apiGet(`/companies/${companyId}/dfc`).catch(() => null),
      apiGet(`/companies/${companyId}/forecast`).catch(() => null),
      apiGet(`/companies/${companyId}/alerts`).catch(() => []),
    ]).then(([dashboardData, dfcData, forecastData, alertsData]) => {
      setData(dashboardData);
      setDfc(dfcData);
      setForecast(forecastData);
      setAlerts(alertsData);
      setLoading(false);
    });
  }, [companyId]);

  const health = useMemo(() => {
    if (!data || !dfc) return { label: 'Sem leitura', color: '#667085' };
    const balance = Number(data.consolidated_balance || 0);
    const net = Number(dfc.net_cash_generation || 0);
    if (balance < 0 || net < 0) return { label: 'Atenção', color: '#B42318' };
    if (balance < 5000) return { label: 'Observação', color: '#B54708' };
    return { label: 'Saudável', color: '#027A48' };
  }, [data, dfc]);

  const cards = data
    ? [
        ['Saldo consolidado', `R$ ${Number(data.consolidated_balance).toLocaleString('pt-BR')}`],
        ['Entradas', `R$ ${Number(data.inflows).toLocaleString('pt-BR')}`],
        ['Saídas', `R$ ${Number(data.outflows).toLocaleString('pt-BR')}`],
        ['Lançamentos', String(data.total_launches)],
      ]
    : [['Saldo consolidado', '—'], ['Entradas', '—'], ['Saídas', '—'], ['Lançamentos', '—']];

  const isEmpty = data && Number(data.total_accounts) === 0 && Number(data.total_launches) === 0;

  return (
    <AppShell
      title="Dashboard"
      subtitle="Camada executiva inicial do produto, agora conectada à empresa do usuário autenticado."
      actions={<Link href="/lancamentos/novo" style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Novo lançamento</Link>}
    >
      {sessionLoading || loading ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24, color: '#475467' }}>Carregando visão financeira...</div>
      ) : !companyId ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>
          <div style={{ fontWeight: 700 }}>Sessão não encontrada.</div>
          <div style={{ marginTop: 8, color: '#475467' }}>Faça login para carregar a empresa e os dados financeiros.</div>
        </div>
      ) : isEmpty ? (
        <div style={{ display: 'grid', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 24 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>Ambiente inicial</div>
            <h2 style={{ margin: '10px 0 0' }}>A empresa ainda não tem base operacional cadastrada.</h2>
            <p style={{ color: '#475467', lineHeight: 1.7 }}>Para o dashboard ficar útil, comece criando contas, categorias e os primeiros lançamentos. Assim o DFC, os alertas e a projeção passam a refletir a operação real.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
              <Link href="/contas" style={{ background: '#0f172a', color: '#fff', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Criar conta</Link>
              <Link href="/categorias" style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Criar categoria</Link>
              <Link href="/lancamentos/novo" style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Registrar lançamento</Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16, color: health.color, fontWeight: 700 }}>Saúde do caixa: {health.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
            {cards.map(([title, value]) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>{title}</div>
                <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>DFC inicial</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
                <div><strong>Operacional líquido</strong><div>R$ {dfc ? Number(dfc.operational_inflows - dfc.operational_outflows).toLocaleString('pt-BR') : '—'}</div></div>
                <div><strong>Investimento líquido</strong><div>R$ {dfc ? Number(dfc.investment_inflows - dfc.investment_outflows).toLocaleString('pt-BR') : '—'}</div></div>
                <div><strong>Financiamento líquido</strong><div>R$ {dfc ? Number(dfc.financing_inflows - dfc.financing_outflows).toLocaleString('pt-BR') : '—'}</div></div>
              </div>
              <div style={{ marginTop: 16, fontWeight: 700 }}>Geração líquida de caixa: R$ {dfc ? Number(dfc.net_cash_generation).toLocaleString('pt-BR') : '—'}</div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>Projeção de caixa</div>
              <div style={{ marginTop: 12 }}>Risco de liquidez: <strong>{forecast?.liquidity_risk ?? '—'}</strong></div>
              <div style={{ marginTop: 8 }}>Saldo atual: <strong>R$ {forecast ? Number(forecast.current_balance).toLocaleString('pt-BR') : '—'}</strong></div>
              <div style={{ marginTop: 8 }}>Média diária de entradas: <strong>R$ {forecast ? Number(forecast.average_daily_inflows).toLocaleString('pt-BR') : '—'}</strong></div>
              <div style={{ marginTop: 8 }}>Média diária de saídas: <strong>R$ {forecast ? Number(forecast.average_daily_outflows).toLocaleString('pt-BR') : '—'}</strong></div>
              <div style={{ marginTop: 12, color: '#475467' }}>{forecast?.recommendation ?? '—'}</div>
              <div style={{ marginTop: 16, display: 'grid', gap: 6 }}>
                {forecast?.points?.slice(0, 7).map((point: any) => (
                  <div key={point.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475467' }}>
                    <span>Dia {point.day}</span>
                    <strong>R$ {Number(point.projected_balance).toLocaleString('pt-BR')}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>Alertas</div>
            <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
              {alerts.length ? alerts.map((alert, idx) => (
                <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 16, background: '#f8fafc' }}>
                  <div style={{ fontWeight: 700 }}>{alert.title}</div>
                  <div style={{ marginTop: 8, color: '#475467' }}>{alert.description}</div>
                  <div style={{ marginTop: 8, color: '#0f172a' }}>{alert.recommendation}</div>
                </div>
              )) : <div style={{ color: '#667085' }}>Nenhum alerta relevante no momento.</div>}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
