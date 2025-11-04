from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..deps import get_db
from .. import models
from ..schemas import FlexibilityCheckCreate, FlexibilityCheckRead
from typing import List

router = APIRouter()


@router.get("/flexibility-checks/", response_model=List[FlexibilityCheckRead])
def read_flexibility_checks(db: Session = Depends(get_db)):
    checks = db.query(models.FlexibilityCheck).all()
    return checks


@router.get("/flexibility-check/{id}", response_model=FlexibilityCheckRead)
def read_flexibility_check(id: str, db: Session = Depends(get_db)):
    check = db.query(models.FlexibilityCheck).filter(
        models.FlexibilityCheck.id == id).first()
    if check is None:
        raise HTTPException(
            status_code=404, detail="Flexibility check not found")
    return check


@router.post("/flexibility-checks/", response_model=FlexibilityCheckRead)
def create_flexibility_check(check: FlexibilityCheckCreate, db: Session = Depends(get_db)):
    db_check = models.FlexibilityCheck(**check.model_dump())
    db.add(db_check)
    db.commit()
    db.refresh(db_check)
    return db_check


@router.put("/flexibility-checks/{check_id}", response_model=FlexibilityCheckRead)
def update_flexibility_check(check_id: int, check: FlexibilityCheckCreate, db: Session = Depends(get_db)):
    db_check = db.query(models.FlexibilityCheck).filter(
        models.FlexibilityCheck.id == check_id).first()
    if db_check is None:
        raise HTTPException(
            status_code=404, detail="Flexibility check not found")
    for key, value in check.model_dump().items():
        setattr(db_check, key, value)
    db.commit()
    db.refresh(db_check)
    return db_check


@router.delete("/flexibility-checks/{check_id}")
def delete_flexibility_check(check_id: int, db: Session = Depends(get_db)):
    db_check = db.query(models.FlexibilityCheck).filter(
        models.FlexibilityCheck.id == check_id).first()
    if db_check is None:
        raise HTTPException(
            status_code=404, detail="Flexibility check not found")
    db.delete(db_check)
    db.commit()
    return {"message": "Flexibility check deleted successfully"}
