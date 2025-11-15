from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..deps import get_db
from .. import models
from ..enums import SurfaceType, TestFormat
from ..schemas import UserCreate, UserRead, UserUpdate, UserResultCreate, UserResultRead
from typing import List

router = APIRouter()


@router.post("/users/", response_model=UserRead)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/users/{user_id}", response_model=UserRead)
async def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    data = payload.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    if not user.results:
        user.results = []
    return user


@router.get("/users/{user_id}", response_model=UserRead)
async def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.results:
        user.results = []
    return user


@router.get("/users/", response_model=List[UserRead])
async def read_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users


@router.post("/user_results/", response_model=UserResultRead)
async def create_user_result(user_result: UserResultCreate, db: Session = Depends(get_db)):
    result_data = user_result.dict()
    # Enumの値が数値のため、そのまま使用（バリデーションは必要に応じて追加可能）
    # 数値が有効なEnum値かチェック
    if result_data.get("serfece") is not None:
        try:
            SurfaceType(result_data["serfece"])  # バリデーション
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid serfece value: {result_data['serfece']}. Valid values: {[e.value for e in SurfaceType]}"
            )
    if result_data.get("test_format") is not None:
        try:
            TestFormat(result_data["test_format"])  # バリデーション
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid test_format value: {result_data['test_format']}. Valid values: {[e.value for e in TestFormat]}"
            )
    # Map _25m_run to the actual column name
    if "_25m_run" in result_data:
        result_data["_25m_run"] = result_data.pop("_25m_run")
    db_user_result = models.UserResult(**result_data)
    db.add(db_user_result)
    db.commit()
    db.refresh(db_user_result)
    return db_user_result


@router.delete("/user_results/{result_id}")
async def delete_user_result(result_id: int, db: Session = Depends(get_db)):
    result = db.query(models.UserResult).filter(models.UserResult.id == result_id).first()
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    db.delete(result)
    db.commit()
    return {"message": "Result deleted successfully"}


@router.get("/user_results/{user_id}", response_model=List[UserResultRead])
async def read_user_results(user_id: int, db: Session = Depends(get_db)):
    results = db.query(models.UserResult).filter(models.UserResult.user_id == user_id).all()
    if not results:
        raise HTTPException(status_code=404, detail="Results not found")
    return results


