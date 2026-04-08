from decimal import Decimal
from pydantic import BaseModel


class DashboardOut(BaseModel):
    company_id: int
    total_accounts: int
    total_launches: int
    consolidated_balance: Decimal
    inflows: Decimal
    outflows: Decimal
