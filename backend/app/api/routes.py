from pathlib import Path
from uuid import uuid4
from datetime import date
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import desc, select
from sqlalchemy.orm import Session
from app.api.deps import get_current_user
from app.core.db import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.entities import Company, User, Account, Category, Launch, RecurringRule
from app.schemas.auth import LoginInput, TokenOutput
from app.schemas.company import CompanyCreate, CompanyOut
from app.schemas.account import AccountCreate, AccountOut, AccountUpdate
from app.schemas.category import CategoryCreate, CategoryOut, CategoryUpdate
from app.schemas.launch import LaunchCreate, LaunchOut, LaunchUpdate
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.schemas.dashboard import DashboardOut
from app.schemas.dfc import DfcOut
from app.schemas.forecast import ForecastOut
from app.schemas.alert import AlertOut
from app.schemas.recurring import RecurringRuleCreate, RecurringRuleOut, RecurringRuleUpdate
from app.services.cashflow.balance_engine import recalculate_account_balance
from app.services.cashflow.dfc_engine import build_dfc
from app.services.projections.forecast_engine import build_forecast
from app.services.analytics.dashboard import build_company_dashboard
from app.services.analytics.alerts import build_alerts
from app.services.classification.rules_engine import suggest_category

router = APIRouter()
UPLOAD_DIR = Path('storage/attachments')
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def serialize_launch(db: Session, row: Launch) -> LaunchOut:
    category = db.get(Category, row.category_id) if row.category_id else None
    created_by = db.get(User, row.created_by_user_id) if getattr(row, 'created_by_user_id', None) else None
    updated_by = db.get(User, row.updated_by_user_id) if getattr(row, 'updated_by_user_id', None) else None
    result = LaunchOut.model_validate(row, from_attributes=True)
    result.category_name = category.name if category else None
    result.created_by_name = created_by.name if created_by else None
    result.updated_by_name = updated_by.name if updated_by else None
    return result


def serialize_category(db: Session, row: Category) -> CategoryOut:
    created_by = db.get(User, row.created_by_user_id) if getattr(row, 'created_by_user_id', None) else None
    updated_by = db.get(User, row.updated_by_user_id) if getattr(row, 'updated_by_user_id', None) else None
    result = CategoryOut.model_validate(row, from_attributes=True)
    result.created_by_name = created_by.name if created_by else None
    result.updated_by_name = updated_by.name if updated_by else None
    return result


def serialize_recurring_rule(db: Session, row: RecurringRule) -> RecurringRuleOut:
    created_by = db.get(User, row.created_by_user_id) if getattr(row, 'created_by_user_id', None) else None
    updated_by = db.get(User, row.updated_by_user_id) if getattr(row, 'updated_by_user_id', None) else None
    result = RecurringRuleOut.model_validate(row, from_attributes=True)
    result.created_by_name = created_by.name if created_by else None
    result.updated_by_name = updated_by.name if updated_by else None
    return result


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
    row = User(company_id=payload.company_id, name=payload.name, email=payload.email, password_hash=hash_password(payload.password), role=payload.role)
    db.add(row); db.commit(); db.refresh(row)
    return row


@router.get('/companies/{company_id}/users', response_model=list[UserOut])
def list_users(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = list(db.scalars(select(User).where(User.company_id == company_id).order_by(User.id.desc())).all())
    return [serialize_user(db, row) for row in rows]


@router.put('/users/{user_id}', response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.get(User, user_id)
    if not row:
        raise HTTPException(status_code=404, detail='user_not_found')
    row.name = payload.name
    row.email = str(payload.email)
    row.role = payload.role
    row.is_active = payload.is_active
    row.updated_by_user_id = current_user.id
    if payload.password:
        row.password_hash = hash_password(payload.password)
    db.add(row); db.commit(); db.refresh(row)
    return serialize_user(db, row)


@router.post('/companies', response_model=CompanyOut)
def create_company(payload: CompanyCreate, db: Session = Depends(get_db)):
    row = Company(**payload.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row


@router.get('/companies', response_model=list[CompanyOut])
def list_companies(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(Company)).all())


@router.post('/accounts', response_model=AccountOut)
def create_account(payload: AccountCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    row = Account(**payload.model_dump(), current_balance=payload.initial_balance)
    db.add(row); db.commit(); db.refresh(row)
    return row


@router.get('/companies/{company_id}/accounts', response_model=list[AccountOut])
def list_accounts(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return list(db.scalars(select(Account).where(Account.company_id == company_id)).all())


@router.put('/accounts/{account_id}', response_model=AccountOut)
def update_account(account_id: int, payload: AccountUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    row = db.get(Account, account_id)
    if not row:
        raise HTTPException(status_code=404, detail='account_not_found')
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    db.add(row)
    db.commit()
    db.refresh(row)
    recalculate_account_balance(db, row.id)
    db.refresh(row)
    return row


@router.post('/categories', response_model=CategoryOut)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = Category(**payload.model_dump(), created_by_user_id=current_user.id, updated_by_user_id=current_user.id)
    db.add(row); db.commit(); db.refresh(row)
    return serialize_category(db, row)


@router.get('/companies/{company_id}/categories', response_model=list[CategoryOut])
def list_categories(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = list(db.scalars(select(Category).where(Category.company_id == company_id)).all())
    return [serialize_category(db, row) for row in rows]


@router.put('/categories/{category_id}', response_model=CategoryOut)
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.get(Category, category_id)
    if not row:
        raise HTTPException(status_code=404, detail='category_not_found')
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    row.updated_by_user_id = current_user.id
    db.add(row); db.commit(); db.refresh(row)
    return serialize_category(db, row)


@router.delete('/categories/{category_id}')
def delete_category(category_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    row = db.get(Category, category_id)
    if not row:
        raise HTTPException(status_code=404, detail='category_not_found')
    db.delete(row)
    db.commit()
    return {'ok': True, 'id': category_id}


@router.post('/recurring-rules', response_model=RecurringRuleOut)
def create_recurring_rule(payload: RecurringRuleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = RecurringRule(**payload.model_dump(), created_by_user_id=current_user.id, updated_by_user_id=current_user.id)
    db.add(row); db.commit(); db.refresh(row)
    return serialize_recurring_rule(db, row)


@router.get('/companies/{company_id}/recurring-rules', response_model=list[RecurringRuleOut])
def list_recurring_rules(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = list(db.scalars(select(RecurringRule).where(RecurringRule.company_id == company_id)).all())
    return [serialize_recurring_rule(db, row) for row in rows]


@router.put('/recurring-rules/{rule_id}', response_model=RecurringRuleOut)
def update_recurring_rule(rule_id: int, payload: RecurringRuleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.get(RecurringRule, rule_id)
    if not row:
        raise HTTPException(status_code=404, detail='recurring_rule_not_found')
    for key, value in payload.model_dump().items():
        setattr(row, key, value)
    row.updated_by_user_id = current_user.id
    db.add(row); db.commit(); db.refresh(row)
    return serialize_recurring_rule(db, row)


@router.delete('/recurring-rules/{rule_id}')
def delete_recurring_rule(rule_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    row = db.get(RecurringRule, rule_id)
    if not row:
        raise HTTPException(status_code=404, detail='recurring_rule_not_found')
    db.delete(row)
    db.commit()
    return {'ok': True, 'id': rule_id}


@router.post('/launches', response_model=LaunchOut)
def create_launch(payload: LaunchCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = payload.model_dump()
    if not data.get('category_id'):
        categories = list(db.scalars(select(Category).where(Category.company_id == payload.company_id, Category.is_active == True)).all())
        suggested = suggest_category(payload.description, categories)
        if suggested:
            data['category_id'] = suggested
            data['classification_status'] = 'sugerido'
    row = Launch(**data, created_by_user_id=current_user.id, updated_by_user_id=current_user.id)
    db.add(row); db.commit(); db.refresh(row)
    recalculate_account_balance(db, row.account_id)
    return serialize_launch(db, row)


@router.post('/launches/upload', response_model=LaunchOut)
async def create_launch_with_upload(
    company_id: int = Form(...),
    account_id: int = Form(...),
    launch_date: str = Form(...),
    description: str = Form(...),
    amount: str = Form(...),
    type: str = Form(...),
    category_id: int | None = Form(None),
    subcategory: str | None = Form(None),
    counterparty: str | None = Form(None),
    notes: str | None = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    attachment_url = None
    if file and file.filename:
        suffix = Path(file.filename).suffix or '.bin'
        name = f"{uuid4().hex}{suffix}"
        target = UPLOAD_DIR / name
        target.write_bytes(await file.read())
        attachment_url = str(target)
    payload = LaunchCreate(company_id=company_id, account_id=account_id, category_id=category_id, launch_date=launch_date, description=description, amount=amount, type=type, subcategory=subcategory, counterparty=counterparty, notes=notes, attachment_url=attachment_url)
    return create_launch(payload, db, _)


@router.put('/launches/{launch_id}', response_model=LaunchOut)
def update_launch(launch_id: int, payload: LaunchUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.get(Launch, launch_id)
    if not row:
        raise HTTPException(status_code=404, detail='launch_not_found')

    previous_account_id = row.account_id
    data = payload.model_dump()
    if not data.get('category_id'):
        categories = list(db.scalars(select(Category).where(Category.company_id == row.company_id, Category.is_active == True)).all())
        suggested = suggest_category(payload.description, categories)
        row.classification_status = 'sugerido' if suggested else 'validado'
        data['category_id'] = suggested
    else:
        row.classification_status = 'validado'

    for key, value in data.items():
        setattr(row, key, value)
    row.updated_by_user_id = current_user.id

    db.add(row)
    db.commit()
    db.refresh(row)
    recalculate_account_balance(db, previous_account_id)
    if row.account_id != previous_account_id:
        recalculate_account_balance(db, row.account_id)
    return serialize_launch(db, row)


@router.post('/launches/{launch_id}/cancel', response_model=LaunchOut)
def cancel_launch(launch_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.get(Launch, launch_id)
    if not row:
        raise HTTPException(status_code=404, detail='launch_not_found')
    row.status = 'cancelado'
    row.updated_by_user_id = current_user.id
    db.add(row)
    db.commit()
    db.refresh(row)
    recalculate_account_balance(db, row.account_id)
    return serialize_launch(db, row)


@router.get('/companies/{company_id}/launches', response_model=list[LaunchOut])
def list_launches(
    company_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
    status: str | None = Query(None),
    type: str | None = Query(None),
    account_id: int | None = Query(None),
    category_id: int | None = Query(None),
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    q: str | None = Query(None),
    order: str = Query('date_desc'),
):
    stmt = select(Launch).where(Launch.company_id == company_id)
    if status:
        stmt = stmt.where(Launch.status == status)
    if type:
        stmt = stmt.where(Launch.type == type)
    if account_id:
        stmt = stmt.where(Launch.account_id == account_id)
    if category_id:
        stmt = stmt.where(Launch.category_id == category_id)
    if date_from:
        stmt = stmt.where(Launch.launch_date >= date_from)
    if date_to:
        stmt = stmt.where(Launch.launch_date <= date_to)
    if q:
        stmt = stmt.where(Launch.description.ilike(f'%{q}%'))

    if order == 'date_asc':
        stmt = stmt.order_by(Launch.launch_date.asc(), Launch.id.asc())
    elif order == 'amount_desc':
        stmt = stmt.order_by(desc(Launch.amount), desc(Launch.launch_date))
    elif order == 'amount_asc':
        stmt = stmt.order_by(Launch.amount.asc(), desc(Launch.launch_date))
    else:
        stmt = stmt.order_by(desc(Launch.launch_date), desc(Launch.id))

    launches = list(db.scalars(stmt).all())
    return [serialize_launch(db, row) for row in launches]


@router.get('/accounts/{account_id}/balance')
def account_balance(account_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    balance = recalculate_account_balance(db, account_id)
    return {'account_id': account_id, 'current_balance': balance}


@router.get('/companies/{company_id}/dashboard', response_model=DashboardOut)
def company_dashboard(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return build_company_dashboard(db, company_id)


@router.get('/companies/{company_id}/dfc', response_model=DfcOut)
def company_dfc(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return build_dfc(db, company_id)


@router.get('/companies/{company_id}/forecast', response_model=ForecastOut)
def company_forecast(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return build_forecast(db, company_id)


@router.get('/companies/{company_id}/alerts', response_model=list[AlertOut])
def company_alerts(company_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    dashboard = build_company_dashboard(db, company_id)
    dfc = build_dfc(db, company_id)
    forecast = build_forecast(db, company_id)
    return build_alerts(float(dashboard['consolidated_balance']), float(dfc['net_cash_generation']), forecast['liquidity_risk'])
