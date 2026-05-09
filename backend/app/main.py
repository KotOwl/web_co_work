from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.database import engine, Base
from app.routers import auth, users, transactions, categories, budgets, statistics

# Create database tables first
Base.metadata.create_all(bind=engine)

# Perform simple migrations
with engine.connect() as conn:
    # Check if currency column exists in transactions table
    try:
        conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR DEFAULT 'UAH'"))
        conn.commit()
    except Exception as e:
        print(f"Migration notice: {e}")

app = FastAPI(
    title="Finance Tracker API",
    description="API for personal finance management",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, you can specify your render frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(budgets.router)
app.include_router(statistics.router)


@app.get("/")
def root():
    return {
        "message": "Finance Tracker API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
