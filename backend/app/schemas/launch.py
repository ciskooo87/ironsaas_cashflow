from datetime import date
from decimal import Decimal
from pydantic import BaseModel


class LaunchCreate(BaseModel):
    company_id: int
    account_id: int
    category_id: int | None = None
    launch_date: date
    description: str
    amount: Decimal
    type: str
    subcategory: str | None = None
    counterparty: str | None = None
    notes: str | None = None
    attachment_url: str | None = None


class LaunchUpdate(BaseModel):
    account_id: int
    category_id: int | None = None
    launch_date: date
    description: str
    amount: Decimal
    type: str
    subcategory: str | None = None
    counterparty: str | None = None
    notes: str | None = None
    attachment_url: str | None = None
    status: str = 'confirmado'


class LaunchOut(LaunchCreate):
    id: int
    source: str
    status: str
    classification_status: str
    category_name: str | None = None
    created_by_user_id: int | None = None
    updated_by_user_id: int | None = None
    created_by_name: str | None = None
    updated_by_name: str | None = None

    class Config:
        from_attributes = True
