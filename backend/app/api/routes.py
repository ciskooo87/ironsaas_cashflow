from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.security import create_access_token, verify_password
from app.models.entities import Company, User, Account, Category, Launch
from app.schemas.auth import LoginInput, TokenOutput
from app.schemas.company import CompanyCreate, CompanyOut
from app.schemas.account import AccountCreate, AccountOut
from app.schemas.category import CategoryCreate, CategoryOut
from app.schemas.launch import LaunchCreate, LaunchOut
from app.services.cashflow.balance_engine import recalculate_account_balance

router = APIRouter()

@router.post('/auth/login', response_model=TokenOutput)
def login(payload: LoginInput, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail='invalid_credentials')
    return TokenOutput(access_token=create_access_token(str(user.id)))

@router.post('/companies', response_model=CompanyOut)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    row = Company(**payload.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row

@router.get('/companies', response_model=list[CompanyOut])
def list_companies(db: Session = Depends(get_db)):
    return list(db.scalars(select(Company)).all())

@router.post('/accounts', response_model=AccountOut)
def create_account(payload: AccountCreate, db: Session = Depends(get_db)):
    row = Account(**payload.model_dump(), current_balance=payload.initial_balance)
    db.add(row); db.commit(); db.refresh(row)
    return row

@router.get('/companies/{company_id}/accounts', response_model=list[AccountOut])
def list_accounts(company_id: int, db: Session = Depends(get_db)):
    return list(db.scalars(select(Account).where(Account.company_id == company_id)).all())

@router.post('/categories', response_model=CategoryOut)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    row = Category(**payload.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row

@router.get('/companies/{company_id}/categories', response_model=list[CategoryOut])
def list_categories(company_id: int, db: Session = Depends(get_db)):
    return list(db.scalars(select(Category).where(Category.company_id == company_id)).all())

@router.post('/launches', response_model=LaunchOut)
def create_launch(payload: LaunchCreate, db: Session = Depends(get_db)):
    row = Launch(**payload.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    recalculate_account_balance(db, row.account_id)
    return row

@router.get('/companies/{company_id}/launches', response_model=list[LaunchOut])
def list_launches(company_id: int, db: Session = Depends(get_db)):
    return list(db.scalars(select(Launch).where(Launch.company_id == company_id)).all())

@router.get('/accounts/{account_id}/balance')
def account_balance(account_id: int, db: Session = Depends(get_db)):
    balance = recalculate_account_balance(db, account_id)
    return {'account_id': account_id, 'current_balance': balance}
