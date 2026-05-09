from pydantic import BaseModel, EmailStr
from datetime import datetime, date
from typing import Optional, List
from app.models import Currency, TransactionType


# User schemas
class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    password: str
    currency: Currency = Currency.UAH


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    currency: Optional[Currency] = None


class User(UserBase):
    id: int
    currency: Currency
    created_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str


# Category schemas
class CategoryBase(BaseModel):
    name: str
    type: TransactionType
    icon: str = "wallet"
    color: str = "#6366f1"


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class Category(CategoryBase):
    id: int
    is_default: bool
    user_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True


# Transaction schemas


class TransactionBase(BaseModel):
    amount: float
    type: TransactionType
    description: Optional[str] = None
    date: date
    category_id: int
    currency: Currency = Currency.UAH


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date] = None
    category_id: Optional[int] = None
    currency: Optional[Currency] = None


class Transaction(TransactionBase):
    id: int
    user_id: int
    created_at: datetime
    category: Optional[Category] = None
    
    class Config:
        from_attributes = True


# Budget schemas
class BudgetBase(BaseModel):
    amount: float
    period: str
    category_id: Optional[int] = None


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    amount: Optional[float] = None
    period: Optional[str] = None


class Budget(BudgetBase):
    id: int
    user_id: int
    spent: float = 0.0
    created_at: datetime
    category: Optional[Category] = None
    
    class Config:
        from_attributes = True


# Statistics schemas
class BalanceStats(BaseModel):
    total_income: float
    total_expense: float
    balance: float


class CategoryStats(BaseModel):
    category: Category
    total: float
    percentage: float


class PeriodStats(BaseModel):
    period: str
    income: float
    expense: float
    balance: float


class DashboardStats(BaseModel):
    current_balance: float
    monthly_income: float
    monthly_expense: float
    top_expenses: List[CategoryStats]
    recent_transactions: List[Transaction]
