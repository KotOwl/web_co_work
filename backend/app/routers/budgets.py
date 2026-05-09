from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Budget, BudgetCreate, BudgetUpdate
from app.models import User
from app import crud

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=List[Budget])
def list_budgets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.get_budgets(db, user_id=current_user.id)


@router.post("", response_model=Budget, status_code=201)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.create_budget(db, budget, current_user.id)


@router.put("/{budget_id}", response_model=Budget)
def update_budget(
    budget_id: int,
    budget_update: BudgetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    updated = crud.update_budget(db, budget_id, budget_update, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Budget not found")
    return updated


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    deleted = crud.delete_budget(db, budget_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"message": "Budget deleted successfully"}
