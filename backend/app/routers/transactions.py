from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Transaction, TransactionCreate, TransactionUpdate
from app.models import User, TransactionType
from app import crud

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=List[Transaction])
def list_transactions(
    skip: int = 0,
    limit: int = 100,
    type: Optional[TransactionType] = None,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = Query(None, description="Filter by start date (ISO format)"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date (ISO format)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.get_transactions(
        db, user_id=current_user.id, skip=skip, limit=limit,
        type=type, category_id=category_id, start_date=start_date, end_date=end_date
    )


@router.post("", response_model=Transaction, status_code=201)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.create_transaction(db, transaction, current_user.id)


@router.get("/{transaction_id}", response_model=Transaction)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    transaction = crud.get_transactions(db, user_id=current_user.id, skip=0, limit=1)
    if not transaction or transaction[0].id != transaction_id:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction[0]


@router.put("/{transaction_id}", response_model=Transaction)
def update_transaction(
    transaction_id: int,
    transaction_update: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    updated = crud.update_transaction(db, transaction_id, transaction_update, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return updated


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    deleted = crud.delete_transaction(db, transaction_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}
