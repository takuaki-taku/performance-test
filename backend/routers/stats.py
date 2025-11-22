from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..deps import get_db
from .. import models
from ..schemas import (
    AverageDataCreate, AverageDataResponse,
    MaxDataCreate, MaxDataResponse
)
from typing import List

router = APIRouter()


@router.post("/average_data/", response_model=AverageDataResponse)
def create_average_data(average_data: AverageDataCreate, db: Session = Depends(get_db)):
    db_average_data = models.AverageData(**average_data.model_dump())
    db.add(db_average_data)
    db.commit()
    db.refresh(db_average_data)
    return db_average_data


@router.get("/average_data/grade/{grade}", response_model=AverageDataResponse)
def read_average_data_by_grade(grade: str, db: Session = Depends(get_db)):
    db_average_data = db.query(models.AverageData).filter(
        models.AverageData.grade == grade).first()
    if db_average_data is None:
        raise HTTPException(status_code=404, detail="Average data not found")
    return db_average_data


@router.post("/max_data/", response_model=MaxDataResponse)
def create_max_data(max_data: MaxDataCreate, db: Session = Depends(get_db)):
    db_max_data = models.MaxData(**max_data.model_dump())
    db.add(db_max_data)
    db.commit()
    db.refresh(db_max_data)
    return db_max_data


@router.get("/max_data/grade/{grade}", response_model=MaxDataResponse)
def read_max_data_by_grade(grade: str, db: Session = Depends(get_db)):
    db_max_data = db.query(models.MaxData).filter(
        models.MaxData.grade == grade).first()
    if db_max_data is None:
        raise HTTPException(status_code=404, detail="Max data not found")
    return db_max_data
