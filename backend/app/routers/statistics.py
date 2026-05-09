from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import BalanceStats, CategoryStats, PeriodStats, DashboardStats, Transaction
from app.models import User, TransactionType
from app import crud

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("/balance", response_model=BalanceStats)
def get_balance(
    start_date: Optional[datetime] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date (ISO format)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.get_balance_stats(db, current_user.id, start_date, end_date)


@router.get("/categories", response_model=list[CategoryStats])
def get_category_statistics(
    type: TransactionType,
    start_date: Optional[datetime] = Query(None, description="Start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="End date (ISO format)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.get_category_stats(db, current_user.id, type, start_date, end_date)


@router.get("/monthly", response_model=list[PeriodStats])
def get_monthly_statistics(
    months: int = Query(6, ge=1, le=24, description="Number of months to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.get_monthly_stats(db, current_user.id, months)


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Current month stats
    today = datetime.now()
    start_of_month = today.replace(day=1, hour=0, minute=0, second=0)
    
    # All time balance up to today
    total_balance_stats = crud.get_balance_stats(db, current_user.id, end_date=today)
    
    # Monthly stats
    monthly_stats = crud.get_balance_stats(db, current_user.id, start_date=start_of_month, end_date=today)
    
    # Top expense categories
    top_expenses = crud.get_category_stats(db, current_user.id, TransactionType.EXPENSE, start_date=start_of_month, end_date=today)
    top_expenses.sort(key=lambda x: x["total"], reverse=True)
    top_expenses = top_expenses[:5]
    
    # Recent transactions
    recent = crud.get_transactions(db, current_user.id, skip=0, limit=5)
    
    return {
        "current_balance": total_balance_stats["balance"],
        "monthly_income": monthly_stats["total_income"],
        "monthly_expense": monthly_stats["total_expense"],
        "top_expenses": top_expenses,
        "recent_transactions": recent
    }
