from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Launch, Category


def normalize_group_type(group_type: str | None) -> str:
    mapping = {
        'operacional': 'operational',
        'operational': 'operational',
        'investimento': 'investment',
        'investment': 'investment',
        'financiamento': 'financing',
        'financing': 'financing',
    }
    return mapping.get((group_type or '').lower(), 'operational')


def build_dfc(db: Session, company_id: int):
    launches = list(db.scalars(select(Launch).where(Launch.company_id == company_id, Launch.status != 'cancelado')).all())
    categories = list(db.scalars(select(Category).where(Category.company_id == company_id)).all())
    category_map = {c.id: normalize_group_type(c.group_type) for c in categories}
    category_name_map = {c.id: c.name for c in categories}

    data = {
        'operational_inflows': Decimal('0'),
        'operational_outflows': Decimal('0'),
        'investment_inflows': Decimal('0'),
        'investment_outflows': Decimal('0'),
        'financing_inflows': Decimal('0'),
        'financing_outflows': Decimal('0'),
    }
    line_totals: dict[str, dict[str, Decimal]] = {
        'operational_inflow_lines': {},
        'operational_outflow_lines': {},
        'investment_inflow_lines': {},
        'investment_outflow_lines': {},
        'financing_inflow_lines': {},
        'financing_outflow_lines': {},
    }

    for launch in launches:
      group_type = category_map.get(launch.category_id, 'operational')
      flow_side = 'inflows' if launch.type == 'entrada' else 'outflows'
      key = f"{group_type}_{flow_side}"
      line_key = f"{group_type}_{'inflow_lines' if launch.type == 'entrada' else 'outflow_lines'}"
      category_name = category_name_map.get(launch.category_id, 'Sem categoria')
      if key in data:
          data[key] += Decimal(launch.amount)
      if line_key in line_totals:
          line_totals[line_key][category_name] = line_totals[line_key].get(category_name, Decimal('0')) + Decimal(launch.amount)

    data['net_cash_generation'] = (
        data['operational_inflows'] - data['operational_outflows'] +
        data['investment_inflows'] - data['investment_outflows'] +
        data['financing_inflows'] - data['financing_outflows']
    )

    for line_key, values in line_totals.items():
        data[line_key] = [
            {'category_name': category_name, 'amount': amount}
            for category_name, amount in sorted(values.items(), key=lambda item: item[1], reverse=True)
        ]

    return data
