import datetime
import uuid
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, DateTime, Enum, TypeDecorator
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.orm import relationship
from .db import Base
from .enums import SurfaceType, TestFormat, TrainingType, AchievementLevel


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses TEXT.
    """
    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PostgresUUID(as_uuid=True))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            # PostgreSQLはUUID型を直接受け取る
            return value
        else:
            # SQLiteはTEXT型として保存
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            # PostgreSQLはUUID型を直接返す
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value) if value else None
            return value
        else:
            # SQLiteはTEXT型からUUIDに変換
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value) if value else None
            return value


class User(Base):
    __tablename__ = "users"
    id = Column(GUID(), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, index=True)
    grade = Column(String)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    birthday = Column(Date, nullable=True)
    results = relationship("UserResult", back_populates="user")
    training_results = relationship("UserTrainingResult", back_populates="user")


class UserResult(Base):
    __tablename__ = "user_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"),
                     index=True, nullable=False)
    date = Column(Date, nullable=False)
    long_jump_cm = Column(Float, nullable=False)
    fifty_meter_run_ms = Column(Float, nullable=False)
    spider_ms = Column(Float, nullable=False)
    eight_shape_run_count = Column(Float, nullable=False)
    ball_throw_cm = Column(Float, nullable=False)
    _25m_run = Column(Float, nullable=True, name="25m_run")
    # Enumの値が数値のため、Integer型で保存
    serfece = Column(Integer, nullable=True)
    test_format = Column(Integer, nullable=True)
    user = relationship("User", back_populates="results")


class AverageData(Base):
    __tablename__ = "average_data"
    id = Column(Integer, primary_key=True, index=True)
    grade = Column(String, index=True, nullable=False, unique=True)
    long_jump_cm = Column(Float, nullable=False)
    fifty_meter_run_ms = Column(Float, nullable=False)
    spider_ms = Column(Float, nullable=False)
    eight_shape_run_count = Column(Float, nullable=False)
    ball_throw_cm = Column(Float, nullable=False)
    total_score = Column(Float)


class MaxData(Base):
    __tablename__ = "max_data"
    id = Column(Integer, primary_key=True, index=True)
    grade = Column(String, index=True, nullable=False, unique=True)
    long_jump_cm = Column(Integer, nullable=False)
    fifty_meter_run_ms = Column(Integer, nullable=False)
    spider_ms = Column(Integer, nullable=False)
    eight_shape_run_count = Column(Integer, nullable=False)
    ball_throw_cm = Column(Integer, nullable=False)
    total_score = Column(Integer)


class Training(Base):
    """トレーニング項目マスタ（ストレッチ、コア、筋トレ、ラダーなど）"""
    __tablename__ = "trainings"
    id = Column(Integer, primary_key=True, index=True)
    training_type = Column(Integer, nullable=False, index=True)  # TrainingType Enum
    title = Column(String, nullable=False)
    image_path = Column(String, nullable=True)  # 画像がある場合
    description = Column(String, nullable=False)
    instructions = Column(String, nullable=True)  # 実施方法の詳細
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow)
    results = relationship("UserTrainingResult", back_populates="training")


class UserTrainingResult(Base):
    """ユーザーのトレーニング実施結果"""
    __tablename__ = "user_training_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id"), index=True, nullable=False)
    training_id = Column(Integer, ForeignKey("trainings.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    achievement_level = Column(Integer, nullable=False)  # AchievementLevel Enum (1-3)
    comment = Column(String, nullable=True)  # コメント/フィードバック
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="training_results")
    training = relationship("Training", back_populates="results")


# 後方互換性のため、FlexibilityCheckは残しておく（将来的に削除予定）
class FlexibilityCheck(Base):
    __tablename__ = "flexibility_checks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow)
