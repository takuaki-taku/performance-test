import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from .db import Base
from .enums import SurfaceType, TestFormat


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    grade = Column(String)
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    birthday = Column(Date, nullable=True)
    results = relationship("UserResult", back_populates="user")


class UserResult(Base):
    __tablename__ = "user_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
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


class AverageMaxData(Base):
    __tablename__ = "average_max_data"
    id = Column(Integer, primary_key=True, index=True)
    grade = Column(String, index=True, nullable=False)
    type = Column(String, index=True)
    long_jump_cm = Column(Integer, nullable=False)
    fifty_meter_run_ms = Column(Integer, nullable=False)
    spider_ms = Column(Integer, nullable=False)
    eight_shape_run_count = Column(Integer, nullable=False)
    ball_throw_cm = Column(Integer, nullable=False)
    total_score = Column(Integer)


class FlexibilityCheck(Base):
    __tablename__ = "flexibility_checks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow)
