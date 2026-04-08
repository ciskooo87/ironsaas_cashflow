"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

function formatMoney(value: number | string | undefined) {
  return `R$ ${Number(value || 0).toLocaleString('pt-BR')}`;
}

export default function DashboardPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [data, setData] = useState<any | null>(null);
  const [dfc, setDfc] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState({ date_from: '', date_to: '' });

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    const launchesQuery = new URLSearchParams();
    if (period.date_from) launchesQuery.set('date_from', period.date_from);
    if (period.date_to) launchesQuery.set('date_to', period.date_to);
    const suffix = launchesQuery.toString() ? `?${launchesQuery.toString()}` : '';

    Promise.all([
      apiGet(`/companies/${companyId}/dashboard`).catch((e) => e),
      apiGet(`/companies/${companyId}/dfc`).catch((e) => e),
      apiGet(`/companies/${companyId}/forecast`).catch((e) => e),
      apiGet(`/companies/${companyId}/alerts`).catch(() => []),
      apiGet(`/companies/${companyId}/launches${suffix}`).catch((e) => e),
    ]).then(([dashboardData, dfcData, forecastData, alertsData, launchesData]) => {
      if (dashboardData instanceof Error || dfcData instanceof Error || forecastData instanceof Error || launchesData instanceof Error) {
        const mainError = [dashboardData, dfcData, forecastData, launchesData].find((item) => item instanceof Error) as Error | undefined;
        setError(mainError?.message === 'session_expired' ? 'Sua sessão expirou. Faça login novamente para continuar.' : 'Não foi possível carregar o dashboard agora.');
        setLoading(false);
        return;
      }

      const filteredLaunches = Array.isArray(launchesData) ? launchesData : [];
      const filteredInflows = filteredLaunches.filter((launch: any) => launch.type === 'entrada' && launch.status !== 'cancelado').reduce((acc: number, launch: any) => acc + Number(launch.amount), 0);
      const filteredOutflows = filteredLaunches.filter((launch: any) => launch.type === 'saida' && launch.status !== 'cancelado').reduce((acc: number, launch: any) => acc + Number(launch.amount), 0);
      const filteredNet = filteredInflows - filteredOutflows;

      setData({ ...dashboardData, filtered_launches: filteredLaunches.length, filtered_inflows: filteredInflows, filtered_outflows: filteredOutflows, filtered_net_flow: filteredNet });
      setDfc(dfcData);
      setForecast(forecastData);
      setAlerts(alertsData);
      setLoading(false);
    });
  }, [companyId, period]);

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
        ['Saldo consolidado', formatMoney(data.consolidated_balance)],
        ['Fluxo líquido', formatMoney(data.net_flow)],
        ['Entradas', formatMoney(data.inflows)],
        ['Saídas', formatMoney(data.outflows)],
      ]
    : [['Saldo consolidado', '—'], ['Fluxo líquido', '—'], ['Entradas', '—'], ['Saídas', '—']];

  const isEmpty = data && Number(data.total_accounts) === 0 && Number(data.total_launches) === 0;
  const minProjectedBalance = forecast?.points?.length ? Math.min(...forecast.points.map((point: any) => Number(point.projected_balance || 0))) : null;
  const projectedRunwayText = minProjectedBalance !== null && minProjectedBalance < 0
    ? 'A projeção atravessa caixa negativo dentro da janela analisada.'
    : minProjectedBalance !== null
      ? `Pior saldo projetado na janela: ${formatMoney(minProjectedBalance)}.`
      : 'Sem projeção suficiente para leitura.';

  return (
    <AppShell
      title="Dashboard"
      subtitle="Leitura executiva do caixa da empresa autenticada, com sinais operacionais, recorte por período e risco projetado."
    >
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20, display: 'grid', gap: 14, marginBottom: 20 }}>
        <div style={{ fontWeight: 700 }}>Recorte por período</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          <input value={period.date_from} onChange={(e) => setPeriod({ ...period, date_from: e.target.value })} type="date" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
          <input value={period.date_to} onChange={(e) => setPeriod({ ...period, date_to: e.target.value })} type="date" style={{ padding: 12, borderRadius: 12, border: '1px solid #d0d5dd' }} />
          <button onClick={() => setPeriod({ date_from: '', date_to: '' })} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '12px 16px', fontWeight: 700 }}>Limpar período</button>
        </div>
        {data ? (
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', color: '#475467', fontSize: 14 }}>
            <span>Lançamentos no recorte: <strong>{data.filtered_launches ?? 0}</strong></span>
            <span>Entradas no recorte: <strong>{formatMoney(data.filtered_inflows)}</strong></span>
            <span>Saídas no recorte: <strong>{formatMoney(data.filtered_outflows)}</strong></span>
            <span>Fluxo no recorte: <strong>{formatMoney(data.filtered_net_flow)}</strong></span>
          </div>
        ) : null}
      </div>

      {error ? (
        <div style={{ background: '#fff', border: '1px solid #fecdca', borderRadius: 18, padding: 24, color: '#b42318', marginBottom: 20 }}>{error}</div>
      ) : null}

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

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 24 }}>
            <div style={{ display: 'grid', gap: 24 }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>Leitura operacional</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
                  <div><strong>Lançamentos</strong><div>{data?.total_launches ?? '—'}</div></div>
                  <div><strong>Ticket médio de entrada</strong><div>{data ? formatMoney(data.avg_ticket_inflow) : '—'}</div></div>
                  <div><strong>Ticket médio de saída</strong><div>{data ? formatMoney(data.avg_ticket_outflow) : '—'}</div></div>
                </div>
                <div style={{ marginTop: 16, color: '#475467', lineHeight: 1.7 }}>
                  {Number(data?.net_flow || 0) >= 0
                    ? 'O período observado ainda fecha positivo no fluxo líquido. O foco deve ser sustentar disciplina de caixa e evitar deterioração do saldo projetado.'
                    : 'O período observado fecha com consumo líquido de caixa. Vale revisar rapidamente as saídas, a estrutura de pagamento e a velocidade de recebimento.'}
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>DFC</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, marginTop: 16 }}>
                  <div><strong>Operacional líquido</strong><div>{dfc ? formatMoney(dfc.operational_inflows - dfc.operational_outflows) : '—'}</div></div>
                  <div><strong>Investimento líquido</strong><div>{dfc ? formatMoney(dfc.investment_inflows - dfc.investment_outflows) : '—'}</div></div>
                  <div><strong>Financiamento líquido</strong><div>{dfc ? formatMoney(dfc.financing_inflows - dfc.financing_outflows) : '—'}</div></div>
                </div>
                <div style={{ marginTop: 16, fontWeight: 700 }}>Geração líquida de caixa: {dfc ? formatMoney(dfc.net_cash_generation) : '—'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 24 }}>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>Projeção de caixa</div>
                <div style={{ marginTop: 12 }}>Risco de liquidez: <strong>{forecast?.liquidity_risk ?? '—'}</strong></div>
                <div style={{ marginTop: 8 }}>Saldo atual: <strong>{forecast ? formatMoney(forecast.current_balance) : '—'}</strong></div>
                <div style={{ marginTop: 8 }}>Média diária de entradas: <strong>{forecast ? formatMoney(forecast.average_daily_inflows) : '—'}</strong></div>
                <div style={{ marginTop: 8 }}>Média diária de saídas: <strong>{forecast ? formatMoney(forecast.average_daily_outflows) : '—'}</strong></div>
                <div style={{ marginTop: 12, color: '#475467' }}>{forecast?.recommendation ?? '—'}</div>
                <div style={{ marginTop: 12, color: '#0f172a', fontWeight: 700 }}>{projectedRunwayText}</div>
                <div style={{ marginTop: 16, display: 'grid', gap: 6 }}>
                  {forecast?.points?.slice(0, 7).map((point: any) => (
                    <div key={point.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475467' }}>
                      <span>Dia {point.day}</span>
                      <strong>{formatMoney(point.projected_balance)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 20 }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 700 }}>Prioridades</div>
                <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                  <Link href="/lancamentos/novo" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700 }}>Registrar nova movimentação</Link>
                  <Link href="/recorrencias" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700 }}>Ajustar fluxos recorrentes</Link>
                  <Link href="/categorias" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700 }}>Revisar classificação financeira</Link>
                </div>
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
