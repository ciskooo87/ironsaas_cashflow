from decimal import Decimal
from pydantic import BaseModel


class DashboardOut(BaseModel):
    company_id: int
    total_accounts: int
    total_launches: int
    consolidated_balance: Decimal
    inflows: Decimal
    outflows: Decimal
    net_flow: Decimal
    avg_ticket_inflow: Decimal
    avg_ticket_outflow: Decimal
