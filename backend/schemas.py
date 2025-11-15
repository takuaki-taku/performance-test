import datetime
import uuid
from typing import List, Optional
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    name: str
    grade: str
    birthday: Optional[datetime.date] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None
    birthday: Optional[datetime.date] = None


class UserResultCreate(BaseModel):
    user_id: uuid.UUID
    date: datetime.date
    long_jump_cm: float = Field(gt=0)
    fifty_meter_run_ms: float = Field(gt=0)
    spider_ms: float = Field(gt=0)
    eight_shape_run_count: float = Field(gt=0)
    ball_throw_cm: float = Field(gt=0)
    _25m_run: Optional[float] = None
    serfece: Optional[int] = None  # 1: 人工芝, 2: ハード, 3: クレー
    test_format: Optional[int] = None  # 1: 全国大会, 2: 地域大会


class UserResultRead(BaseModel):
    id: int
    user_id: uuid.UUID
    date: datetime.date
    long_jump_cm: float
    fifty_meter_run_ms: float
    spider_ms: float
    eight_shape_run_count: float
    ball_throw_cm: float
    _25m_run: Optional[float] = None
    serfece: Optional[int] = None  # 1: 人工芝, 2: ハード, 3: クレー
    test_format: Optional[int] = None  # 1: 全国大会, 2: 地域大会

    class Config:
        from_attributes = True  # Pydantic V2

    @property
    def long_jump(self) -> float:
        return self.long_jump_cm / 100.0

    @property
    def fifty_meter_run(self) -> float:
        return self.fifty_meter_run_ms / 1000.0

    @property
    def spider(self) -> float:
        return self.spider_ms / 1000.0

    @property
    def eight_shape_run(self) -> int:
        return self.eight_shape_run_count

    @property
    def ball_throw(self) -> float:
        return self.ball_throw_cm / 100.0


class UserRead(BaseModel):
    id: uuid.UUID
    name: str
    grade: str
    birthday: Optional[datetime.date] = None
    results: List[UserResultRead]

    class Config:
        from_attributes = True  # Pydantic V2


class AverageMaxDataBase(BaseModel):
    grade: str
    long_jump: float
    fifty_meter_run: float
    spider: float
    eight_shape_run: int
    ball_throw: float
    total_score: Optional[int] = None


class AverageMaxDataCreate(AverageMaxDataBase):
    pass


class AverageMaxDataRead(AverageMaxDataBase):
    id: int
    type: str

    class Config:
        from_attributes = True  # Pydantic V2


class AverageDataBase(BaseModel):
    grade: str
    long_jump_cm: float
    fifty_meter_run_ms: float
    spider_ms: float
    eight_shape_run_count: float
    ball_throw_cm: float
    total_score: Optional[float] = None


class AverageDataCreate(AverageDataBase):
    pass


class AverageDataResponse(AverageDataBase):
    id: int

    class Config:
        from_attributes = True


class MaxDataBase(BaseModel):
    grade: str
    long_jump_cm: int
    fifty_meter_run_ms: int
    spider_ms: int
    eight_shape_run_count: int
    ball_throw_cm: int
    total_score: Optional[int] = None


class MaxDataCreate(MaxDataBase):
    pass


class MaxDataResponse(MaxDataBase):
    id: int

    class Config:
        from_attributes = True


class FlexibilityCheckBase(BaseModel):
    title: str
    image_path: str
    description: str


class FlexibilityCheckCreate(FlexibilityCheckBase):
    pass


class FlexibilityCheckRead(FlexibilityCheckBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True
