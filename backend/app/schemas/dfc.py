from decimal import Decimal
from pydantic import BaseModel


class DfcOut(BaseModel):
    operational_inflows: Decimal
    operational_outflows: Decimal
    investment_inflows: Decimal
    investment_outflows: Decimal
    financing_inflows: Decimal
    financing_outflows: Decimal
    net_cash_generation: Decimal
