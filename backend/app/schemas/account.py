from decimal import Decimal
from pydantic import BaseModel


class AccountCreate(BaseModel):
    company_id: int
    name: str
    type: str
    bank_name: str | None = None
    initial_balance: Decimal = Decimal("0")


class AccountOut(AccountCreate):
    id: int
    current_balance: Decimal
    is_active: bool

    class Config:
        from_attributes = True
