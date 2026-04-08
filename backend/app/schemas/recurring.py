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


class RecurringRuleUpdate(BaseModel):
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
    created_by_user_id: int | None = None
    updated_by_user_id: int | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None

    class Config:
        from_attributes = True
