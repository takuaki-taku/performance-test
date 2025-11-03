from fastapi import Request
import json
import base64
import os
import datetime
from typing import Annotated, List, Optional
from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Date, Float, DateTime, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel, Field

router = APIRouter()

# データベースの設定
DATABASE_URL = "sqlite:///./backend/test.db"
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
    firebase_uid = Column(String, unique=True, index=True, nullable=True)
    results = relationship("UserResult", back_populates="user")


class UserResult(Base):
    __tablename__ = "user_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"),
                     index=True, nullable=False)
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


# 柔軟性チェック用のモデル
class FlexibilityCheck(Base):
    __tablename__ = "flexibility_checks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    image_path = Column(String, nullable=False)
    description = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow)


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


# 柔軟性チェック用のPydanticモデル
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


def ensure_schema():
    Base.metadata.create_all(bind=engine)
    # SQLite 簡易マイグレーション: users に firebase_uid カラムが無ければ追加
    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA table_info(users)"))
        cols = [row[1] for row in res.fetchall()]
        if "firebase_uid" not in cols:
            conn.execute(
                text("ALTER TABLE users ADD COLUMN firebase_uid TEXT"))
            # 可能ならユニーク索引を追加（SQLite は後付け UNIQUE 制約はCREATE INDEXで代替）
            conn.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)"))
            conn.commit()


ensure_schema()

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
# Firebase IDトークン検証（開発では検証スキップ可）


def _decode_jwt_no_verify(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return {}
        payload_b64 = parts[1] + "==="
        payload = base64.urlsafe_b64decode(
            payload_b64[: len(payload_b64) - (len(payload_b64) % 4)])
        return json.loads(payload)
    except Exception:
        return {}


async def get_current_firebase_uid(request: Request) -> Optional[str]:
    authz = request.headers.get(
        "authorization") or request.headers.get("Authorization")
    if not authz or not authz.lower().startswith("bearer "):
        return None
    token = authz.split(" ", 1)[1]
    verify = os.getenv("FIREBASE_VERIFY", "false").lower() == "true"
    if not verify:
        payload = _decode_jwt_no_verify(token)
        return payload.get("sub")
    # ここに本番用の verify 実装を追加（firebase-admin 等）。現状は未設定ならNone。
    return None


@app.get("/me", response_model=UserRead)
async def get_me(request: Request, db: db_dependency):
    uid = await get_current_firebase_uid(request)
    if not uid:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if user is None:
        # 初回アクセス時に最低限のユーザーを作成
        user = User(name="User", grade="",)
        user.firebase_uid = uid
        db.add(user)
        db.commit()
        db.refresh(user)
    if not user.results:
        user.results = []
    return user


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
    db_average_data = db.query(AverageData).filter(
        AverageData.grade == grade).first()
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


# 柔軟性チェック用のAPIエンドポイント
@app.get("/flexibility-checks/", response_model=List[FlexibilityCheckRead])
def read_flexibility_checks(db: Session = Depends(get_db)):
    checks = db.query(FlexibilityCheck).all()
    return checks

@app.get("/flexibility-check/{id}", response_model=FlexibilityCheckRead)
def read_flexibility_checks(id: str, db: Session = Depends(get_db)):
    check = db.query(FlexibilityCheck).filter(FlexibilityCheck.id == id).first()
    return check

@app.post("/flexibility-checks/", response_model=FlexibilityCheckRead)
def create_flexibility_check(check: FlexibilityCheckCreate, db: Session = Depends(get_db)):
    db_check = FlexibilityCheck(**check.model_dump())
    db.add(db_check)
    db.commit()
    db.refresh(db_check)
    return db_check


@app.put("/flexibility-checks/{check_id}", response_model=FlexibilityCheckRead)
def update_flexibility_check(check_id: int, check: FlexibilityCheckCreate, db: Session = Depends(get_db)):
    db_check = db.query(FlexibilityCheck).filter(
        FlexibilityCheck.id == check_id).first()
    if db_check is None:
        raise HTTPException(
            status_code=404, detail="Flexibility check not found")

    for key, value in check.model_dump().items():
        setattr(db_check, key, value)

    db.commit()
    db.refresh(db_check)
    return db_check


@app.delete("/flexibility-checks/{check_id}")
def delete_flexibility_check(check_id: int, db: Session = Depends(get_db)):
    db_check = db.query(FlexibilityCheck).filter(
        FlexibilityCheck.id == check_id).first()
    if db_check is None:
        raise HTTPException(
            status_code=404, detail="Flexibility check not found")

    db.delete(db_check)
    db.commit()
    return {"message": "Flexibility check deleted successfully"}


app.include_router(router)
