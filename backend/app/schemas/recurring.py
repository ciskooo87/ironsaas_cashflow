from decimal import Decimal
from pydantic import BaseModel


class RecurringRuleCreate(BaseModel):
    company_id: int
    account_id: int
    category_id: int | None = None
    description: str
    amount: Decimal
    type: str
    frequency: str
    day_of_month: int | None = None
    is_active: bool = True


class RecurringRuleOut(RecurringRuleCreate):
    id: int

    class Config:
        from_attributes = True
