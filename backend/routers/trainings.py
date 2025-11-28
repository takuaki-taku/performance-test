from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from ..deps import get_db
from .. import models
from ..schemas import (
    TrainingCreate,
    TrainingRead,
    UserTrainingResultCreate,
    UserTrainingResultRead,
    UserTrainingResultWithTraining,
    UserTrainingSummaryResponse,
    UserTrainingCategorySummary,
)
from typing import List, Optional, Dict
from ..enums import TrainingType, AchievementLevel
import uuid

router = APIRouter()


@router.get("/trainings/", response_model=List[TrainingRead])
def read_trainings(
    training_type: Optional[int] = None,
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


@router.get(
    "/user-training-summary/{user_id}",
    response_model=UserTrainingSummaryResponse,
)
def read_user_training_summary(
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    ユーザーのトレーニングサマリ（カテゴリ別・熟練度別の件数）を取得

    - 1種目につき最新の記録だけを対象にする
    - achievement_level:
        1 -> needs_improvement
        2 -> achieved
        3 -> excellent
    """
    # ユーザー存在確認
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    # trainings と user_training_results を JOIN し、ユーザーの全結果を取得
    # 後続の処理で「トレーニングごとに最新1件」に絞り込む
    joined_results: List[models.UserTrainingResult] = (
        db.query(models.UserTrainingResult)
        .join(
            models.Training,
            models.UserTrainingResult.training_id == models.Training.id,
        )
        .filter(models.UserTrainingResult.user_id == user_id)
        .order_by(
            models.UserTrainingResult.training_id,
            models.UserTrainingResult.date.desc(),
        )
        .all()
    )

    # トレーニングごとに最新1件を採用
    latest_by_training: Dict[int, models.UserTrainingResult] = {}
    for r in joined_results:
        if r.training_id not in latest_by_training:
            latest_by_training[r.training_id] = r

    total_trainings_with_status = len(latest_by_training)

    # カテゴリ別に集計
    summary_by_type: Dict[int, Dict[str, int]] = {}
    for result in latest_by_training.values():
        training: models.Training = result.training
        training_type_value = training.training_type

        if training_type_value not in summary_by_type:
            summary_by_type[training_type_value] = {
                "needs_improvement": 0,
                "achieved": 0,
                "excellent": 0,
            }

        level = result.achievement_level
        if level == AchievementLevel.NEEDS_IMPROVEMENT.value:
            summary_by_type[training_type_value]["needs_improvement"] += 1
        elif level == AchievementLevel.ACHIEVED.value:
            summary_by_type[training_type_value]["achieved"] += 1
        elif level == AchievementLevel.EXCELLENT.value:
            summary_by_type[training_type_value]["excellent"] += 1

    categories: List[UserTrainingCategorySummary] = []
    for training_type_value, counts in summary_by_type.items():
        try:
            training_type_enum = TrainingType(training_type_value)
            training_type_label = training_type_enum.name
        except ValueError:
            training_type_label = str(training_type_value)

        categories.append(
            UserTrainingCategorySummary(
                training_type=training_type_value,
                training_type_label=training_type_label,
                needs_improvement=counts["needs_improvement"],
                achieved=counts["achieved"],
                excellent=counts["excellent"],
            )
        )

    return UserTrainingSummaryResponse(
        user_id=user_id,
        total_trainings_with_status=total_trainings_with_status,
        categories=categories,
    )

