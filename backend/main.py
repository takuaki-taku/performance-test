import datetime
from typing import Annotated, List, Optional
from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Date, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, Field

router = APIRouter()

# データベースの設定
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)
Base = declarative_base()


# モデルの定義
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    grade = Column(String)
    results = relationship("UserResult", back_populates="user")


class UserResult(Base):
    __tablename__ = "user_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    date = Column(Date, nullable=False)
    long_jump_cm = Column(Integer, nullable=False)
    fifty_meter_run_ms = Column(Integer, nullable=False)
    spider_ms = Column(Integer, nullable=False)
    eight_shape_run_count = Column(Integer, nullable=False)
    ball_throw_cm = Column(Integer, nullable=False)
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
    total_score = Column(Float)  # ここをFloatに変更


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


# Pydanticモデルの定義
class UserCreate(BaseModel):
    name: str
    grade: str


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


# データベースの作成
Base.metadata.create_all(bind=engine)

# FastAPIアプリケーションの作成
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 依存性注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


# APIエンドポイント
@app.post("/users/", response_model=UserRead)
async def create_user(user: UserCreate, db: db_dependency):
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/users/{user_id}", response_model=UserRead)
async def read_user(user_id: int, db: db_dependency):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.results:
        user.results = []
    return user


@app.get("/users/", response_model=list[UserRead])
async def read_users(db: db_dependency, skip: int = 0, limit: int = 100):
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@app.post("/user_results/", response_model=UserResultRead)
async def create_user_result(user_result: UserResultCreate, db: db_dependency):
    db_user_result = UserResult(**user_result.dict())
    db.add(db_user_result)
    db.commit()
    db.refresh(db_user_result)
    return db_user_result


@router.delete("/user_results/{result_id}")
async def delete_user_result(result_id: int, db: db_dependency):
    result = db.query(UserResult).filter(UserResult.id == result_id).first()
    if result is None:
        raise HTTPException(status_code=404, detail="Result not found")
    db.delete(result)
    db.commit()
    return {"message": "Result deleted successfully"}


@router.post("/average_max_data/", response_model=AverageMaxDataRead)
async def create_average_max_data(
    average_max_data: AverageMaxDataCreate, db: db_dependency
):
    db_average_max_data = AverageMaxData(**average_max_data.model_dump())
    db.add(db_average_max_data)
    db.commit()
    db.refresh(db_average_max_data)
    return db_average_max_data


@router.get("/average_max_data/grade/{grade}", response_model=List[AverageMaxDataRead])
async def read_average_max_data_by_grade(grade: str, db: db_dependency):
    average_max_data = (
        db.query(AverageMaxData).filter(AverageMaxData.grade == grade).all()
    )
    if average_max_data is None:
        raise HTTPException(status_code=404, detail="AverageMaxData not found")
    return average_max_data


@app.post("/average_data/", response_model=AverageDataResponse)
def create_average_data(average_data: AverageDataCreate, db: Session = Depends(get_db)):
    db_average_data = AverageData(**average_data.model_dump())
    db.add(db_average_data)
    db.commit()
    db.refresh(db_average_data)
    return db_average_data


@app.get("/average_data/grade/{grade}", response_model=AverageDataResponse)
def read_average_data_by_grade(grade: str, db: Session = Depends(get_db)):
    db_average_data = db.query(AverageData).filter(AverageData.grade == grade).first()
    if db_average_data is None:
        raise HTTPException(status_code=404, detail="Average data not found")
    return db_average_data


@app.post("/max_data/", response_model=MaxDataResponse)
def create_max_data(max_data: MaxDataCreate, db: Session = Depends(get_db)):
    db_max_data = MaxData(**max_data.model_dump())
    db.add(db_max_data)
    db.commit()
    db.refresh(db_max_data)
    return db_max_data


@app.get("/max_data/grade/{grade}", response_model=MaxDataResponse)
def read_max_data_by_grade(grade: str, db: Session = Depends(get_db)):
    db_max_data = db.query(MaxData).filter(MaxData.grade == grade).first()
    if db_max_data is None:
        raise HTTPException(status_code=404, detail="Max data not found")
    return db_max_data


@app.get("/user_results/{user_id}", response_model=List[UserResultRead])
async def read_user_results(user_id: int, db: db_dependency):
    results = db.query(UserResult).filter(UserResult.user_id == user_id).all()
    if not results:
        raise HTTPException(status_code=404, detail="Results not found")
    return results


app.include_router(router)
