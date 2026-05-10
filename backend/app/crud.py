from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, extract
from datetime import datetime, timedelta
from typing import List, Optional
from app.models import User, Transaction, Category, Budget, TransactionType
from app.schemas import UserCreate, TransactionCreate, TransactionUpdate, CategoryCreate, CategoryUpdate, BudgetCreate, BudgetUpdate
from app.auth import get_password_hash


# Currency Conversion Rates (Base: UAH)
CURRENCY_RATES = {
    "UAH": 1.0,
    "USD": 38.5,
    "EUR": 41.5,
    "PLN": 9.8,
}


def convert_amount(amount: float, from_curr: str, to_curr: str) -> float:
    if from_curr == to_curr:
        return amount
    
    # Convert to base (UAH)
    base_amount = amount * CURRENCY_RATES.get(from_curr, 1.0)
    # Convert from base to target
    target_amount = base_amount / CURRENCY_RATES.get(to_curr, 1.0)
    return target_amount


# User CRUD
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        currency=user.currency
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create default categories for new user
    create_default_categories(db, db_user.id)
    
    return db_user


def update_user(db: Session, user_id: int, user_update):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return None
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user


# Category CRUD
def create_default_categories(db: Session, user_id: int):
    default_categories = [
        # Income categories
        {"name": "Зарплата", "type": TransactionType.INCOME, "icon": "💰", "color": "#22c55e", "is_default": True},
        {"name": "Фріланс", "type": TransactionType.INCOME, "icon": "💻", "color": "#3b82f6", "is_default": True},
        {"name": "Інвестиції", "type": TransactionType.INCOME, "icon": "📈", "color": "#8b5cf6", "is_default": True},
        # Expense categories
        {"name": "Їжа", "type": TransactionType.EXPENSE, "icon": "🍔", "color": "#ef4444", "is_default": True},
        {"name": "Транспорт", "type": TransactionType.EXPENSE, "icon": "🚗", "color": "#f97316", "is_default": True},
        {"name": "Розваги", "type": TransactionType.EXPENSE, "icon": "🎮", "color": "#ec4899", "is_default": True},
        {"name": "Комунальні", "type": TransactionType.EXPENSE, "icon": "🏠", "color": "#6366f1", "is_default": True},
        {"name": "Здоров'я", "type": TransactionType.EXPENSE, "icon": "💊", "color": "#14b8a6", "is_default": True},
        {"name": "Покупки", "type": TransactionType.EXPENSE, "icon": "🛍️", "color": "#f59e0b", "is_default": True},
    ]
    
    for cat_data in default_categories:
        category = Category(
            name=cat_data["name"],
            type=cat_data["type"],
            icon=cat_data["icon"],
            color=cat_data["color"],
            is_default=True,
            user_id=user_id
        )
        db.add(category)
    
    db.commit()


def get_categories(db: Session, user_id: int, type: Optional[TransactionType] = None):
    query = db.query(Category).filter(
        Category.user_id == user_id
    )
    if type:
        query = query.filter(Category.type == type)
    return query.all()


def create_category(db: Session, category: CategoryCreate, user_id: int):
    db_category = Category(**category.model_dump(), user_id=user_id, is_default=False)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category_update: CategoryUpdate, user_id: int):
    db_category = db.query(Category).filter(
        and_(Category.id == category_id, Category.user_id == user_id, Category.is_default == False)
    ).first()
    if not db_category:
        return None
    
    update_data = category_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int, user_id: int):
    db_category = db.query(Category).filter(
        and_(Category.id == category_id, Category.user_id == user_id, Category.is_default == False)
    ).first()
    if not db_category:
        return None
    
    db.delete(db_category)
    db.commit()
    return db_category


# Transaction CRUD
def get_transactions(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    type: Optional[TransactionType] = None,
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    
    if type:
        query = query.filter(Transaction.type == type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    return query.order_by(Transaction.date.desc()).offset(skip).limit(limit).options(joinedload(Transaction.category)).all()


def create_transaction(db: Session, transaction: TransactionCreate, user_id: int):
    db_transaction = Transaction(**transaction.model_dump(), user_id=user_id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def update_transaction(db: Session, transaction_id: int, transaction_update: TransactionUpdate, user_id: int):
    db_transaction = db.query(Transaction).filter(
        and_(Transaction.id == transaction_id, Transaction.user_id == user_id)
    ).first()
    if not db_transaction:
        return None
    
    update_data = transaction_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int, user_id: int):
    db_transaction = db.query(Transaction).filter(
        and_(Transaction.id == transaction_id, Transaction.user_id == user_id)
    ).first()
    if not db_transaction:
        return None
    
    db.delete(db_transaction)
    db.commit()
    return db_transaction


# Budget CRUD
def get_budgets(db: Session, user_id: int):
    budgets = db.query(Budget).filter(Budget.user_id == user_id).options(joinedload(Budget.category)).all()
    user = get_user_by_id(db, user_id)
    user_currency = user.currency if user else "UAH"
    
    # Calculate spent for each budget (current month)
    today = datetime.now()
    start_of_month = today.replace(day=1, hour=0, minute=0, second=0)
    
    for budget in budgets:
        query = db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.category_id == budget.category_id,
                Transaction.date >= start_of_month,
                Transaction.date <= today,
                Transaction.type == TransactionType.EXPENSE
            )
        )
        transactions = query.all()
        spent = 0.0
        for t in transactions:
            spent += convert_amount(t.amount, t.currency, user_currency)
        
        budget.spent = spent
    
    return budgets


def create_budget(db: Session, budget: BudgetCreate, user_id: int):
    db_budget = Budget(**budget.model_dump(), user_id=user_id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget


def update_budget(db: Session, budget_id: int, budget_update: BudgetUpdate, user_id: int):
    db_budget = db.query(Budget).filter(
        and_(Budget.id == budget_id, Budget.user_id == user_id)
    ).first()
    if not db_budget:
        return None
    
    update_data = budget_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_budget, key, value)
    
    db.commit()
    db.refresh(db_budget)
    return db_budget


def delete_budget(db: Session, budget_id: int, user_id: int):
    db_budget = db.query(Budget).filter(
        and_(Budget.id == budget_id, Budget.user_id == user_id)
    ).first()
    if not db_budget:
        return None
    
    db.delete(db_budget)
    db.commit()
    return db_budget


# Statistics
def get_balance_stats(db: Session, user_id: int, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    user = get_user_by_id(db, user_id)
    user_currency = user.currency if user else "UAH"
    
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.all()
    
    total_income = 0.0
    total_expense = 0.0
    
    for t in transactions:
        converted = convert_amount(t.amount, t.currency, user_currency)
        if t.type == TransactionType.INCOME:
            total_income += converted
        else:
            total_expense += converted
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense
    }


def get_category_stats(db: Session, user_id: int, type: TransactionType, start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    user = get_user_by_id(db, user_id)
    user_currency = user.currency if user else "UAH"
    
    query = db.query(Transaction).filter(
        and_(Transaction.user_id == user_id, Transaction.type == type)
    )
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    transactions = query.all()
    
    cat_stats = {}
    for t in transactions:
        if not t.category:
            continue
        
        cat_id = t.category.id
        if cat_id not in cat_stats:
            cat_stats[cat_id] = {"category": t.category, "total": 0.0}
        
        cat_stats[cat_id]["total"] += convert_amount(t.amount, t.currency, user_currency)
    
    total_amount = sum(s["total"] for s in cat_stats.values()) or 1
    
    return [
        {
            "category": s["category"],
            "total": s["total"],
            "percentage": round((s["total"] / total_amount) * 100, 2)
        }
        for s in cat_stats.values()
    ]


def get_monthly_stats(db: Session, user_id: int, months: int = 6):
    stats = []
    today = datetime.now()
    
    for i in range(months):
        month_date = today.replace(day=1) - timedelta(days=i * 30)
        start_date = month_date.replace(day=1)
        if month_date.month == 12:
            end_date = month_date.replace(year=month_date.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end_date = month_date.replace(month=month_date.month + 1, day=1) - timedelta(days=1)
        
        balance_stats = get_balance_stats(db, user_id, start_date, end_date)
        stats.append({
            "period": start_date.strftime("%Y-%m"),
            "income": balance_stats["total_income"],
            "expense": balance_stats["total_expense"],
            "balance": balance_stats["balance"]
        })
    
    return list(reversed(stats))
