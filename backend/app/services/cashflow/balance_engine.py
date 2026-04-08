from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models.entities import Account, Launch


def recalculate_account_balance(db: Session, account_id: int) -> Decimal:
    account = db.get(Account, account_id)
    if not account:
        raise ValueError("account_not_found")
    launches = db.scalars(select(Launch).where(Launch.account_id == account_id)).all()
    balance = Decimal(account.initial_balance or 0)
    for launch in launches:
        if launch.type == "entrada":
            balance += Decimal(launch.amount)
        else:
            balance -= Decimal(launch.amount)
    account.current_balance = balance
    db.add(account)
    db.commit()
    db.refresh(account)
    return balance
