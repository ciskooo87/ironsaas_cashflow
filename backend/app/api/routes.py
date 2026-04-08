from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.db import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.entities import Company, User, Account, Category, Launch
from app.schemas.auth import LoginInput, TokenOutput
from app.schemas.company import CompanyCreate, CompanyOut
from app.schemas.account import AccountCreate, AccountOut
from app.schemas.category import CategoryCreate, CategoryOut
from app.schemas.launch import LaunchCreate, LaunchOut
from app.schemas.user import UserCreate, UserOut
from app.schemas.dashboard import DashboardOut
from app.services.cashflow.balance_engine import recalculate_account_balance
from app.services.analytics.dashboard import build_company_dashboard

router = APIRouter()

@router.post('/auth/login', response_model=TokenOutput)
def login(payload: LoginInput, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail='invalid_credentials')
    return TokenOutput(access_token=create_access_token(str(user.id)))

@router.get('/auth/me', response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post('/users', response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    exists = db.scalar(select(User).where(User.email == payload.email))
    if exists:
        raise HTTPException(status_code=409, detail='email_already_exists')
    row = User(
        company_id=payload.company_id,
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.post('/companies', response_model=CompanyOut)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    row = Company(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.get('/companies', response_model=list[CompanyOut])
def list_companies(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(Company)).all())

@router.post('/accounts', response_model=AccountOut)
def create_account(payload: AccountCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    row = Account(**payload.model_dump(), current_balance=payload.initial_balance)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.get('/companies/{company_id}/accounts', response_model=list[AccountOut])
def list_accounts(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(Account).where(Account.company_id == company_id)).all())

@router.post('/categories', response_model=CategoryOut)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    row = Category(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

@router.get('/companies/{company_id}/categories', response_model=list[CategoryOut])
def list_categories(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(Category).where(Category.company_id == company_id)).all())

@router.post('/launches', response_model=LaunchOut)
def create_launch(payload: LaunchCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    row = Launch(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    recalculate_account_balance(db, row.account_id)
    return row

@router.get('/companies/{company_id}/launches', response_model=list[LaunchOut])
def list_launches(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(Launch).where(Launch.company_id == company_id)).all())

@router.get('/accounts/{account_id}/balance')
def account_balance(account_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    balance = recalculate_account_balance(db, account_id)
    return {'account_id': account_id, 'current_balance': balance}

@router.get('/companies/{company_id}/dashboard', response_model=DashboardOut)
def company_dashboard(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return build_company_dashboard(db, company_id)
