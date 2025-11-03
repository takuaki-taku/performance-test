import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    name: str
    grade: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    grade: Optional[str] = None


class UserResultCreate(BaseModel):
    user_id: int
    date: datetime.date
    long_jump_cm: int = Field(gt=0)
    fifty_meter_run_ms: int = Field(gt=0)
    spider_ms: int = Field(gt=0)
    eight_shape_run_count: int = Field(gt=0)
    ball_throw_cm: int = Field(gt=0)


class UserResultRead(BaseModel):
    id: int
    user_id: int
    date: datetime.date
    long_jump_cm: int
    fifty_meter_run_ms: int
    spider_ms: int
    eight_shape_run_count: int
    ball_throw_cm: int

    class Config:
        orm_mode = True

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
    id: int
    name: str
    grade: str
    results: List[UserResultRead]

    class Config:
        orm_mode = True


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
        orm_mode = True


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
