from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Account, Launch, RecurringRule


def build_forecast(db: Session, company_id: int, horizon_days: int = 15):
    launches = list(db.scalars(select(Launch).where(Launch.company_id == company_id, Launch.status != 'cancelado')).all())
    recurring = list(db.scalars(select(RecurringRule).where(RecurringRule.company_id == company_id, RecurringRule.is_active == True)).all())
    accounts = list(db.scalars(select(Account).where(Account.company_id == company_id)).all())
    current_balance = float(sum(Decimal(a.current_balance or 0) for a in accounts))

    if launches:
        inflows = [float(l.amount) for l in launches if l.type == 'entrada']
        outflows = [float(l.amount) for l in launches if l.type == 'saida']
        avg_in = sum(inflows) / max(len(inflows), 1)
        avg_out = sum(outflows) / max(len(outflows), 1)
        average_daily_inflows = avg_in / 30
        average_daily_outflows = avg_out / 30
    else:
        average_daily_inflows = 0.0
        average_daily_outflows = 0.0

    recurring_in = sum(float(r.amount) for r in recurring if r.type == 'entrada') / 30 if recurring else 0.0
    recurring_out = sum(float(r.amount) for r in recurring if r.type == 'saida') / 30 if recurring else 0.0
    projected_in = average_daily_inflows + recurring_in
    projected_out = average_daily_outflows + recurring_out

    points = []
    running = current_balance
    for day in range(1, horizon_days + 1):
        running = running + projected_in - projected_out
        points.append({'day': day, 'projected_balance': round(running, 2)})

    liquidity_risk = 'baixo'
    recommendation = 'Manter acompanhamento da geração operacional e do saldo consolidado.'
    if any(p['projected_balance'] < 0 for p in points):
        liquidity_risk = 'critico'
        recommendation = 'Rever saídas, alongar pagamentos e acelerar entradas antes de ruptura de caixa.'
    elif points and min(p['projected_balance'] for p in points) < current_balance * 0.35:
        liquidity_risk = 'medio'
        recommendation = 'Monitorar o consumo de caixa e preparar ação preventiva sobre despesas e capital de giro.'

    return {
        'current_balance': round(current_balance, 2),
        'average_daily_inflows': round(projected_in, 2),
        'average_daily_outflows': round(projected_out, 2),
        'horizon_days': horizon_days,
        'points': points,
        'liquidity_risk': liquidity_risk,
        'recommendation': recommendation,
    }
