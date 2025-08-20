from fastapi import FastAPI, Depends, HTTPException
import uvicorn
from pydantic import BaseModel
from typing_extensions import Annotated, List
from sqlalchemy.orm import Session
from database import engine, SessionLocal
import models
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],          # allow only this origin
    allow_credentials=True,
    allow_methods=['*'],            # GET, POST, etc.
    allow_headers=['*'],
)

class TransactionBase(BaseModel):
    amount: float
    category: str
    description: str
    is_income: bool
    date: str

class TransactionModel(TransactionBase):
    id: int

    class Config:
        orm_mode = True

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/last-record/")
def get_last_balance(db: Session = Depends(get_db)):
    last_record = db.query(models.Balance).order_by(models.Balance.id.desc()).first();
    if last_record:
        return last_record
    else : return {"amount": 0, "message": "No previous balance"}

db_dependency = Annotated[Session, Depends(get_db)]

models.Base.metadata.create_all(bind=engine)

@app.post("/transactions/", response_model=TransactionModel)
async def create_transaction(transaction: TransactionBase, db: db_dependency):
    db_transaction = models.Transaction(**transaction.dict())

    # Get last balance
    last_balance_record = db.query(models.Balance).order_by(models.Balance.id.desc()).first()
    current_balance = last_balance_record.current_balance if last_balance_record else 0

    # Calculate new balance
    new_balance_amount = current_balance + db_transaction.amount if db_transaction.is_income else current_balance - db_transaction.amount

    # Create new Balance record
    new_balance = models.Balance(current_balance=new_balance_amount)
    db.add(new_balance)
    db.commit()
    db.refresh(new_balance)

    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model= List[TransactionModel])
async def read_transactions(db: db_dependency, skip: int = 0, limit: int = 100):
    transactions = db.query(models.Transaction).offset(skip).limit(limit).all()
    return transactions

@app.post("/reset-db/")
def reset_db(db : Session = Depends(get_db)):
    db.query(models.Transaction).delete()
    db.query(models.Balance).delete()
    db.commit()
    return {"message": "Database reset successfully"}
