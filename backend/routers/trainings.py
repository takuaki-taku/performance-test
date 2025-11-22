from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..deps import get_db
from .. import models
from ..schemas import (
    TrainingCreate, TrainingRead,
    UserTrainingResultCreate, UserTrainingResultRead, UserTrainingResultWithTraining
)
from typing import List
from ..enums import TrainingType, AchievementLevel

router = APIRouter()


@router.get("/trainings/", response_model=List[TrainingRead])
def read_trainings(
    training_type: int = None,
    db: Session = Depends(get_db)
):
    """全トレーニングを取得（training_typeでフィルタリング可能）"""
    query = db.query(models.Training)
    if training_type is not None:
        query = query.filter(models.Training.training_type == training_type)
    trainings = query.all()
    return trainings


@router.get("/trainings/{training_id}", response_model=TrainingRead)
def read_training(training_id: int, db: Session = Depends(get_db)):
    """特定のトレーニングを取得"""
    training = db.query(models.Training).filter(
        models.Training.id == training_id).first()
    if training is None:
        raise HTTPException(
            status_code=404, detail="Training not found")
    return training


@router.post("/trainings/", response_model=TrainingRead)
def create_training(training: TrainingCreate, db: Session = Depends(get_db)):
    """新しいトレーニングを作成"""
    # training_typeのバリデーション
    try:
        TrainingType(training.training_type)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid training_type: {training.training_type}. Valid values: {[e.value for e in TrainingType]}"
        )
    
    db_training = models.Training(**training.model_dump())
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training


@router.put("/trainings/{training_id}", response_model=TrainingRead)
def update_training(
    training_id: int,
    training: TrainingCreate,
    db: Session = Depends(get_db)
):
    """トレーニングを更新"""
    db_training = db.query(models.Training).filter(
        models.Training.id == training_id).first()
    if db_training is None:
        raise HTTPException(
            status_code=404, detail="Training not found")
    
    # training_typeのバリデーション
    if training.training_type is not None:
        try:
            TrainingType(training.training_type)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid training_type: {training.training_type}. Valid values: {[e.value for e in TrainingType]}"
            )
    
    for key, value in training.model_dump().items():
        setattr(db_training, key, value)
    db.commit()
    db.refresh(db_training)
    return db_training


@router.delete("/trainings/{training_id}")
def delete_training(training_id: int, db: Session = Depends(get_db)):
    """トレーニングを削除"""
    db_training = db.query(models.Training).filter(
        models.Training.id == training_id).first()
    if db_training is None:
        raise HTTPException(
            status_code=404, detail="Training not found")
    db.delete(db_training)
    db.commit()
    return {"message": "Training deleted successfully"}


# ユーザーのトレーニング結果関連のエンドポイント

@router.post("/user-training-results/", response_model=UserTrainingResultRead)
def create_user_training_result(
    result: UserTrainingResultCreate,
    db: Session = Depends(get_db)
):
    """ユーザーのトレーニング結果を作成"""
    # achievement_levelのバリデーション
    try:
        AchievementLevel(result.achievement_level)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid achievement_level: {result.achievement_level}. Valid values: {[e.value for e in AchievementLevel]}"
        )
    
    # ユーザーとトレーニングの存在確認
    user = db.query(models.User).filter(
        models.User.id == result.user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    training = db.query(models.Training).filter(
        models.Training.id == result.training_id).first()
    if training is None:
        raise HTTPException(status_code=404, detail="Training not found")
    
    db_result = models.UserTrainingResult(**result.model_dump())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result


@router.get("/user-training-results/{user_id}", response_model=List[UserTrainingResultWithTraining])
def read_user_training_results(
    user_id: str,
    training_type: int = None,
    db: Session = Depends(get_db)
):
    """ユーザーのトレーニング結果を取得"""
    query = db.query(models.UserTrainingResult).filter(
        models.UserTrainingResult.user_id == user_id
    )
    
    if training_type is not None:
        query = query.join(models.Training).filter(
            models.Training.training_type == training_type
        )
    
    results = query.order_by(models.UserTrainingResult.date.desc()).all()
    return results


@router.get("/user-training-results/{user_id}/{training_id}", response_model=List[UserTrainingResultRead])
def read_user_training_result_by_training(
    user_id: str,
    training_id: int,
    db: Session = Depends(get_db)
):
    """特定のトレーニングのユーザー結果を取得"""
    results = db.query(models.UserTrainingResult).filter(
        models.UserTrainingResult.user_id == user_id,
        models.UserTrainingResult.training_id == training_id
    ).order_by(models.UserTrainingResult.date.desc()).all()
    return results


@router.put("/user-training-results/{result_id}", response_model=UserTrainingResultRead)
def update_user_training_result(
    result_id: int,
    result: UserTrainingResultCreate,
    db: Session = Depends(get_db)
):
    """ユーザーのトレーニング結果を更新"""
    db_result = db.query(models.UserTrainingResult).filter(
        models.UserTrainingResult.id == result_id).first()
    if db_result is None:
        raise HTTPException(
            status_code=404, detail="User training result not found")
    
    # achievement_levelのバリデーション
    if result.achievement_level is not None:
        try:
            AchievementLevel(result.achievement_level)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid achievement_level: {result.achievement_level}. Valid values: {[e.value for e in AchievementLevel]}"
            )
    
    for key, value in result.model_dump().items():
        setattr(db_result, key, value)
    db.commit()
    db.refresh(db_result)
    return db_result


@router.delete("/user-training-results/{result_id}")
def delete_user_training_result(result_id: int, db: Session = Depends(get_db)):
    """ユーザーのトレーニング結果を削除"""
    db_result = db.query(models.UserTrainingResult).filter(
        models.UserTrainingResult.id == result_id).first()
    if db_result is None:
        raise HTTPException(
            status_code=404, detail="User training result not found")
    db.delete(db_result)
    db.commit()
    return {"message": "User training result deleted successfully"}

