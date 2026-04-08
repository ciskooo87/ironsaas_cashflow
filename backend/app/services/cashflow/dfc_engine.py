from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Launch, Category


def build_dfc(db: Session, company_id: int):
    launches = list(db.scalars(select(Launch).where(Launch.company_id == company_id, Launch.status != 'cancelado')).all())
    category_map = {c.id: c.group_type for c in db.scalars(select(Category).where(Category.company_id == company_id)).all()}
    data = {
        'operational_inflows': Decimal('0'),
        'operational_outflows': Decimal('0'),
        'investment_inflows': Decimal('0'),
        'investment_outflows': Decimal('0'),
        'financing_inflows': Decimal('0'),
        'financing_outflows': Decimal('0'),
    }
    for launch in launches:
        group_type = category_map.get(launch.category_id, 'operational')
        key = f"{group_type}_{'inflows' if launch.type == 'entrada' else 'outflows'}"
        if key in data:
            data[key] += Decimal(launch.amount)
    data['net_cash_generation'] = (
        data['operational_inflows'] - data['operational_outflows'] +
        data['investment_inflows'] - data['investment_outflows'] +
        data['financing_inflows'] - data['financing_outflows']
    )
    return data
