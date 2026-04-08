from decimal import Decimal
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.entities import Account, Launch


def build_company_dashboard(db: Session, company_id: int):
    total_accounts = db.scalar(select(func.count(Account.id)).where(Account.company_id == company_id)) or 0
    total_launches = db.scalar(select(func.count(Launch.id)).where(Launch.company_id == company_id)) or 0
    consolidated_balance = db.scalar(select(func.coalesce(func.sum(Account.current_balance), 0)).where(Account.company_id == company_id)) or Decimal('0')
    inflows = db.scalar(select(func.coalesce(func.sum(Launch.amount), 0)).where(Launch.company_id == company_id, Launch.type == 'entrada')) or Decimal('0')
    outflows = db.scalar(select(func.coalesce(func.sum(Launch.amount), 0)).where(Launch.company_id == company_id, Launch.type == 'saida')) or Decimal('0')
    inflow_count = db.scalar(select(func.count(Launch.id)).where(Launch.company_id == company_id, Launch.type == 'entrada')) or 0
    outflow_count = db.scalar(select(func.count(Launch.id)).where(Launch.company_id == company_id, Launch.type == 'saida')) or 0

    net_flow = inflows - outflows
    avg_ticket_inflow = (inflows / inflow_count) if inflow_count else Decimal('0')
    avg_ticket_outflow = (outflows / outflow_count) if outflow_count else Decimal('0')

    return {
        'company_id': company_id,
        'total_accounts': int(total_accounts),
        'total_launches': int(total_launches),
        'consolidated_balance': consolidated_balance,
        'inflows': inflows,
        'outflows': outflows,
        'net_flow': net_flow,
        'avg_ticket_inflow': avg_ticket_inflow,
        'avg_ticket_outflow': avg_ticket_outflow,
    }
