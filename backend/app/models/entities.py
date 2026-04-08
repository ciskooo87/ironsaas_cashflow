from __future__ import annotations
from datetime import date
from decimal import Decimal
from sqlalchemy import Boolean, Date, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.db import Base
from app.models.common import TimestampMixin


class Company(TimestampMixin, Base):
    __tablename__ = "companies"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    legal_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    cnpj: Mapped[str | None] = mapped_column(String(32), nullable=True)
    timezone: Mapped[str] = mapped_column(String(64), default="America/Sao_Paulo")
    users: Mapped[list[User]] = relationship(back_populates="company")
    accounts: Mapped[list[Account]] = relationship(back_populates="company")
    categories: Mapped[list[Category]] = relationship(back_populates="company")
    launches: Mapped[list[Launch]] = relationship(back_populates="company")


class User(TimestampMixin, Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"))
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default="operacional")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    company: Mapped[Company] = relationship(back_populates="users")


class Account(TimestampMixin, Base):
    __tablename__ = "accounts"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"))
    name: Mapped[str] = mapped_column(String(120))
    type: Mapped[str] = mapped_column(String(32))
    bank_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    initial_balance: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    current_balance: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    company: Mapped[Company] = relationship(back_populates="accounts")
    launches: Mapped[list[Launch]] = relationship(back_populates="account")


class Category(TimestampMixin, Base):
    __tablename__ = "categories"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"))
    name: Mapped[str] = mapped_column(String(120))
    group_type: Mapped[str] = mapped_column(String(32))
    direction: Mapped[str] = mapped_column(String(16), default="ambos")
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    company: Mapped[Company] = relationship(back_populates="categories")
    launches: Mapped[list[Launch]] = relationship(back_populates="category")


class Launch(TimestampMixin, Base):
    __tablename__ = "launches"
    id: Mapped[int] = mapped_column(primary_key=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id"))
    account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"))
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    launch_date: Mapped[date] = mapped_column(Date)
    description: Mapped[str] = mapped_column(String(255))
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    type: Mapped[str] = mapped_column(String(16))
    subcategory: Mapped[str | None] = mapped_column(String(120), nullable=True)
    counterparty: Mapped[str | None] = mapped_column(String(160), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[str] = mapped_column(String(32), default="manual")
    status: Mapped[str] = mapped_column(String(32), default="confirmado")
    classification_status: Mapped[str] = mapped_column(String(32), default="validado")
    attachment_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company: Mapped[Company] = relationship(back_populates="launches")
    account: Mapped[Account] = relationship(back_populates="launches")
    category: Mapped[Category | None] = relationship(back_populates="launches")
