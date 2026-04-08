def build_alerts(balance: float, net_cash_generation: float, liquidity_risk: str):
    alerts = []
    if balance < 0:
        alerts.append({
            'severity': 'critico',
            'title': 'Saldo consolidado negativo',
            'description': 'O caixa já opera abaixo de zero no consolidado atual.',
            'recommendation': 'Atuar imediatamente em saídas, recomposição de caixa e renegociação de obrigações.',
        })
    if net_cash_generation < 0:
        alerts.append({
            'severity': 'alto',
            'title': 'Geração líquida de caixa negativa',
            'description': 'A operação está consumindo mais caixa do que gera no período observado.',
            'recommendation': 'Rever despesas operacionais, estrutura de pagamento e ritmo de recebimentos.',
        })
    if liquidity_risk in {'medio', 'critico'}:
        alerts.append({
            'severity': liquidity_risk,
            'title': 'Risco projetado de liquidez',
            'description': 'A projeção indica deterioração relevante do saldo nos próximos dias.',
            'recommendation': 'Priorizar medidas preventivas de capital de giro e proteção de caixa.',
        })
    return alerts
