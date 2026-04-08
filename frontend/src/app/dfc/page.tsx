"use client";

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { AppShell } from '@/components/AppShell';
import { useSessionUser } from '@/lib/session';

function formatMoney(value: number | string | undefined) {
  return `R$ ${Number(value || 0).toLocaleString('pt-BR')}`;
}

function DfcBlock({ title, inflows, outflows, linesIn, linesOut }: any) {
  const net = Number(inflows || 0) - Number(outflows || 0);
  const tone = net >= 0 ? { bg: '#ecfdf3', color: '#027A48' } : { bg: '#fef3f2', color: '#B42318' };
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>{title}</div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
            <div><strong>Entradas</strong><div>{formatMoney(inflows)}</div></div>
            <div><strong>Saídas</strong><div>{formatMoney(outflows)}</div></div>
            <div><strong>Líquido</strong><div>{formatMoney(net)}</div></div>
          </div>
        </div>
        <div style={{ background: tone.bg, color: tone.color, borderRadius: 14, padding: '10px 12px', fontWeight: 800 }}>{formatMoney(net)}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 22 }}>
        <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 18, padding: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Composição de entradas</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {linesIn?.length ? linesIn.map((line: any) => <div key={line.category_name} style={{ display: 'flex', justifyContent: 'space-between', color: '#475467', fontSize: 14 }}><span>{line.category_name}</span><strong>{formatMoney(line.amount)}</strong></div>) : <div style={{ color: '#667085', fontSize: 14 }}>Sem entradas neste bloco.</div>}
          </div>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #eaecf0', borderRadius: 18, padding: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>Composição de saídas</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {linesOut?.length ? linesOut.map((line: any) => <div key={line.category_name} style={{ display: 'flex', justifyContent: 'space-between', color: '#475467', fontSize: 14 }}><span>{line.category_name}</span><strong>{formatMoney(line.amount)}</strong></div>) : <div style={{ color: '#667085', fontSize: 14 }}>Sem saídas neste bloco.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DfcPage() {
  const { companyId, loading: sessionLoading } = useSessionUser();
  const [dfc, setDfc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true); setError('');
    apiGet(`/companies/${companyId}/dfc`).then(setDfc).catch((e) => setError(e?.message === 'session_expired' ? 'Sua sessão expirou. Faça login novamente.' : 'Não foi possível carregar o DFC agora.')).finally(() => setLoading(false));
  }, [companyId]);

  return (
    <AppShell title="DFC detalhado" subtitle="Demonstração do fluxo de caixa com visão por bloco, composição por categoria e leitura mais executiva.">
      {sessionLoading || loading ? <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24, color: '#475467' }}>Carregando DFC...</div> : error ? <div style={{ background: '#fff', border: '1px solid #fecdca', borderRadius: 22, padding: 24, color: '#b42318' }}>{error}</div> : !companyId ? <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 22, padding: 24 }}>Faça login para carregar o DFC.</div> : (
        <div style={{ display: 'grid', gap: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 24, padding: 24, boxShadow: '0 16px 40px rgba(15,23,42,0.05)' }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>Resumo</div>
            <div style={{ marginTop: 12, fontSize: 34, fontWeight: 800 }}>Geração líquida de caixa: {formatMoney(dfc?.net_cash_generation)}</div>
          </div>
          <DfcBlock title="Operacional" inflows={dfc?.operational_inflows} outflows={dfc?.operational_outflows} linesIn={dfc?.operational_inflow_lines} linesOut={dfc?.operational_outflow_lines} />
          <DfcBlock title="Investimento" inflows={dfc?.investment_inflows} outflows={dfc?.investment_outflows} linesIn={dfc?.investment_inflow_lines} linesOut={dfc?.investment_outflow_lines} />
          <DfcBlock title="Financiamento" inflows={dfc?.financing_inflows} outflows={dfc?.financing_outflows} linesIn={dfc?.financing_inflow_lines} linesOut={dfc?.financing_outflow_lines} />
        </div>
      )}
    </AppShell>
  );
}
