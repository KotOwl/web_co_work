from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.schemas import Category, CategoryCreate, CategoryUpdate
from app.models import User, TransactionType
from app import crud

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", response_model=List[Category])
def list_categories(
    type: Optional[TransactionType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.get_categories(db, user_id=current_user.id, type=type)


@router.post("", response_model=Category, status_code=201)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.create_category(db, category, current_user.id)


@router.put("/{category_id}", response_model=Category)
def update_category(
    category_id: int,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    updated = crud.update_category(db, category_id, category_update, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Category not found or cannot be modified")
    return updated


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    deleted = crud.delete_category(db, category_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found or cannot be deleted")
    return {"message": "Category deleted successfully"}
