"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

function formatMoney(value: number | string | undefined) {
  return `R$ ${Number(value || 0).toLocaleString('pt-BR')}`;
}

function ExecutiveBarChart({ title, subtitle, items }: { title: string; subtitle?: string; items: { label: string; value: number; tone?: 'positive' | 'negative' | 'neutral' }[] }) {
  const max = Math.max(...items.map((item) => Math.abs(item.value)), 1);
  const colors = {
    positive: { fill: '#12B76A', bg: '#ECFDF3', text: '#027A48' },
    negative: { fill: '#F04438', bg: '#FEF3F2', text: '#B42318' },
    neutral: { fill: '#155EEF', bg: '#EFF4FF', text: '#004EEB' },
  } as const;

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>{title}</div>
      {subtitle ? <div style={{ marginTop: 8, color: '#667085', fontSize: 14 }}>{subtitle}</div> : null}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, color: '#98A2B3', fontSize: 12, fontWeight: 700 }}>
        <span>0</span>
        <span>{formatMoney(max)}</span>
      </div>
      <div style={{ marginTop: 8, display: 'grid', gap: 16 }}>
        {items.map((item) => {
          const tone = item.tone ?? (item.value >= 0 ? 'positive' : 'negative');
          const palette = colors[tone];
          const width = `${Math.max((Math.abs(item.value) / max) * 100, 6)}%`;
          return (
            <div key={item.label} style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#344054' }}>{item.label}</span>
                <span style={{ color: palette.text, background: palette.bg, borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 800 }}>{formatMoney(item.value)}</span>
              </div>
              <div style={{ position: 'relative', height: 18, borderRadius: 999, background: 'repeating-linear-gradient(to right, #f2f4f7 0, #f2f4f7 24%, #e4e7ec 25%)', overflow: 'hidden' }}>
                <div style={{ width, height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${palette.fill} 0%, ${palette.fill}CC 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8, color: '#fff', fontSize: 11, fontWeight: 800 }}>
                  {formatMoney(item.value)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExecutiveForecastChart({ points }: { points: { day: number; projected_balance: number }[] }) {
  if (!points?.length) return null;
  const width = 520;
  const height = 220;
  const pad = 28;
  const min = Math.min(...points.map((p) => p.projected_balance));
  const max = Math.max(...points.map((p) => p.projected_balance));
  const range = Math.max(max - min, 1);
  const yFor = (value: number) => height - pad - ((value - min) / range) * (height - pad * 2);
  const xFor = (index: number) => pad + (index / Math.max(points.length - 1, 1)) * (width - pad * 2);
  const coords = points.map((point, index) => `${xFor(index)},${yFor(point.projected_balance)}`).join(' ');
  const area = `${pad},${height - pad} ${coords} ${width - pad},${height - pad}`;
  const yTicks = [max, max - range / 2, min];

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
      <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>Projeção do caixa</div>
      <div style={{ marginTop: 8, color: '#667085', fontSize: 14 }}>Curva dos próximos dias com grade visual para leitura rápida.</div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 240, marginTop: 16, overflow: 'visible' }}>
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={pad} y1={yFor(tick)} x2={width - pad} y2={yFor(tick)} stroke="#EAECF0" strokeDasharray="4 4" />
            <text x={0} y={yFor(tick) + 4} fontSize="11" fill="#98A2B3">{formatMoney(tick)}</text>
          </g>
        ))}
        <polyline fill="rgba(21,94,239,0.10)" stroke="none" points={area} />
        <polyline fill="none" stroke="#155EEF" strokeWidth="4" points={coords} />
        {points.map((point, index) => (
          <g key={point.day}>
            <circle cx={xFor(index)} cy={yFor(point.projected_balance)} r="5" fill="#155EEF" />
            <text x={xFor(index)} y={height - 6} textAnchor="middle" fontSize="11" fill="#98A2B3">D{point.day}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [data, setData] = useState<any | null>(null);
  const [dfc, setDfc] = useState<any | null>(null);
  const [forecast, setForecast] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [todayPayments, setTodayPayments] = useState<any[]>([]);
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

    const today = new Date().toISOString().slice(0, 10);
    const currentDay = Number(today.slice(-2));

    Promise.all([
      apiGet(`/companies/${companyId}/dashboard`).catch((e) => e),
      apiGet(`/companies/${companyId}/dfc`).catch((e) => e),
      apiGet(`/companies/${companyId}/forecast`).catch((e) => e),
      apiGet(`/companies/${companyId}/alerts`).catch(() => []),
      apiGet(`/companies/${companyId}/launches${suffix}`).catch((e) => e),
      apiGet(`/companies/${companyId}/launches?type=saida&status=confirmado&date_from=${today}&date_to=${today}&order=amount_desc`).catch((e) => e),
      apiGet(`/companies/${companyId}/recurring-rules`).catch((e) => e),
    ]).then(([dashboardData, dfcData, forecastData, alertsData, launchesData, todayLaunchPaymentsData, recurringRulesData]) => {
      if (dashboardData instanceof Error || dfcData instanceof Error || forecastData instanceof Error || launchesData instanceof Error || todayLaunchPaymentsData instanceof Error || recurringRulesData instanceof Error) {
        const mainError = [dashboardData, dfcData, forecastData, launchesData, todayLaunchPaymentsData, recurringRulesData].find((item) => item instanceof Error) as Error | undefined;
        setError(mainError?.message === 'session_expired' ? 'Sua sessão expirou. Faça login novamente para continuar.' : 'Não foi possível carregar o dashboard agora.');
        setLoading(false);
        return;
      }

      const filteredLaunches = Array.isArray(launchesData) ? launchesData : [];
      const filteredInflows = filteredLaunches.filter((launch: any) => launch.type === 'entrada' && launch.status !== 'cancelado').reduce((acc: number, launch: any) => acc + Number(launch.amount), 0);
      const filteredOutflows = filteredLaunches.filter((launch: any) => launch.type === 'saida' && launch.status !== 'cancelado').reduce((acc: number, launch: any) => acc + Number(launch.amount), 0);
      const filteredNet = filteredInflows - filteredOutflows;

      const todayLaunchPayments = Array.isArray(todayLaunchPaymentsData) ? todayLaunchPaymentsData : [];
      const recurringRules = Array.isArray(recurringRulesData) ? recurringRulesData : [];
      const todayRecurringPayments = recurringRules
        .filter((rule: any) => rule.is_active && rule.type === 'saida' && ((rule.frequency === 'monthly' && Number(rule.day_of_month || 1) === currentDay) || (rule.frequency === 'weekly' && currentDay % 7 === 0)))
        .map((rule: any) => ({
          id: `recurring-${rule.id}`,
          description: `${rule.description} (recorrência)`,
          category_name: 'Recorrência',
          launch_date: today,
          amount: rule.amount,
        }));

      setData({ ...dashboardData, filtered_launches: filteredLaunches.length, filtered_inflows: filteredInflows, filtered_outflows: filteredOutflows, filtered_net_flow: filteredNet });
      setDfc(dfcData);
      setForecast(forecastData);
      setAlerts(alertsData);
      setTodayPayments([...todayLaunchPayments, ...todayRecurringPayments]);
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
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, display: 'grid', gap: 14, marginBottom: 20, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
        <div style={{ fontWeight: 800, fontSize: 18 }}>Recorte por período</div>
        <div className="oc-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          <input value={period.date_from} onChange={(e) => setPeriod({ ...period, date_from: e.target.value })} type="date" style={{ padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', fontSize: 14 }} />
          <input value={period.date_to} onChange={(e) => setPeriod({ ...period, date_to: e.target.value })} type="date" style={{ padding: 14, borderRadius: 14, border: '1px solid #d0d5dd', fontSize: 14 }} />
          <button onClick={() => setPeriod({ date_from: '', date_to: '' })} style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 14, padding: '12px 16px', fontWeight: 800 }}>Limpar período</button>
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

      {error ? <div style={{ background: '#fff', border: '1px solid #fecdca', borderRadius: 18, padding: 24, color: '#b42318', marginBottom: 20 }}>{error}</div> : null}

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
              <Link prefetch={false} href="/lancamentos/novo" style={{ background: '#fff', color: '#0f172a', border: '1px solid #d0d5dd', borderRadius: 12, padding: '12px 16px', fontWeight: 700, textDecoration: 'none' }}>Registrar lançamento</Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16, color: health.color, fontWeight: 800, fontSize: 16 }}>Saúde do caixa: {health.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
            {cards.map(([title, value]) => (
              <div key={title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>{title}</div>
                <div style={{ marginTop: 12, fontSize: 32, fontWeight: 800 }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24 }}>
            <div style={{ display: 'grid', gap: 24 }}>
              <ExecutiveBarChart
                title="Leitura operacional"
                subtitle="Resumo visual do comportamento do período corrente."
                items={[
                  { label: 'Entradas', value: Number(data?.inflows || 0), tone: 'positive' },
                  { label: 'Saídas', value: Number(data?.outflows || 0), tone: 'negative' },
                  { label: 'Fluxo líquido', value: Number(data?.net_flow || 0), tone: Number(data?.net_flow || 0) >= 0 ? 'positive' : 'negative' },
                ]}
              />

              <ExecutiveBarChart
                title="DFC executivo"
                subtitle="Contribuição de cada bloco do fluxo de caixa." 
                items={[
                  { label: 'Operacional', value: dfc ? Number(dfc.operational_inflows) - Number(dfc.operational_outflows) : 0, tone: 'neutral' },
                  { label: 'Investimento', value: dfc ? Number(dfc.investment_inflows) - Number(dfc.investment_outflows) : 0, tone: 'neutral' },
                  { label: 'Financiamento', value: dfc ? Number(dfc.financing_inflows) - Number(dfc.financing_outflows) : 0, tone: 'neutral' },
                ]}
              />
            </div>

            <div style={{ display: 'grid', gap: 24 }}>
              <ExecutiveForecastChart points={forecast?.points?.slice(0, 7) ?? []} />

              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>Leitura da projeção</div>
                <div style={{ marginTop: 12 }}>Risco de liquidez: <strong>{forecast?.liquidity_risk ?? '—'}</strong></div>
                <div style={{ marginTop: 8 }}>Saldo atual: <strong>{forecast ? formatMoney(forecast.current_balance) : '—'}</strong></div>
                <div style={{ marginTop: 8 }}>Entradas recorrentes mensais: <strong>{forecast ? formatMoney(forecast.recurring_monthly_inflows) : '—'}</strong></div>
                <div style={{ marginTop: 8 }}>Saídas recorrentes mensais: <strong>{forecast ? formatMoney(forecast.recurring_monthly_outflows) : '—'}</strong></div>
                <div style={{ marginTop: 12, color: '#475467' }}>{forecast?.recommendation ?? '—'}</div>
                <div style={{ marginTop: 12, color: '#0f172a', fontWeight: 800 }}>{projectedRunwayText}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>Pagamentos do dia corrente</div>
              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                {todayPayments.length ? todayPayments.map((payment: any) => (
                  <div key={payment.id} style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{payment.description}</div>
                        <div style={{ marginTop: 6, color: '#475467', fontSize: 14 }}>{payment.category_name ?? 'Sem categoria'} · {payment.launch_date}</div>
                      </div>
                      <div style={{ fontWeight: 800 }}>{formatMoney(payment.amount)}</div>
                    </div>
                  </div>
                )) : <div style={{ color: '#667085' }}>Nenhum pagamento confirmado para hoje.</div>}
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>Alertas</div>
              <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                {alerts.length ? alerts.map((alert, idx) => (
                  <div key={idx} style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, background: '#f8fafc' }}>
                    <div style={{ fontWeight: 700 }}>{alert.title}</div>
                    <div style={{ marginTop: 8, color: '#475467' }}>{alert.description}</div>
                    <div style={{ marginTop: 8, color: '#0f172a' }}>{alert.recommendation}</div>
                  </div>
                )) : <div style={{ color: '#667085' }}>Nenhum alerta relevante no momento.</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
