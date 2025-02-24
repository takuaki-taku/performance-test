import datetime
from typing import Annotated, List, Optional
from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel

router = APIRouter()

# データベースの設定
DATABASE_URL = "sqlite:///./test.db"  # SQLiteデータベースのURL
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)  # エンジンを作成
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)  # セッションを作成
Base = declarative_base()  # データベースの基底クラスを作成


# モデルの定義
class User(Base):
    __tablename__ = "users"  # テーブル名を指定
    id = Column(Integer, primary_key=True, index=True)  # IDカラム
    name = Column(String, index=True)  # 名前カラム
    grade = Column(String)  # 学年カラムをStringに変更
    results = relationship("UserResult", back_populates="user")
    average_max_data = relationship("AverageMaxData", back_populates="users")


class UserResult(Base):
    __tablename__ = "user_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    date = Column(Date, nullable=False)  # Dateカラムを追加
    long_jump = Column(Float)
    fifty_meter_run = Column(Float)
    spider = Column(Float)
    eight_shape_run = Column(Float)
    ball_throw = Column(Float)
    user = relationship("User", back_populates="results")


class AverageMaxData(Base):
    __tablename__ = "average_max_data"
    id = Column(Integer, primary_key=True, index=True)
    grade = Column(
        String, ForeignKey("users.grade"), index=True, nullable=False
    )  # 学年
    type = Column(String, index=True)  # ave or max
    long_jump = Column(Float)  # たち幅跳び
    fifty_meter_run = Column(Float)  # 50m走
    spider = Column(Float)  # スパイダー
    eight_shape_run = Column(Float)  # 8の字ラン
    ball_throw = Column(Float)  # ボール投げ
    total_score = Column(Float)  # 合計点

    users = relationship("User", back_populates="average_max_data")


# Pydanticモデルの定義
class UserCreate(BaseModel):
    name: str  # 名前
    grade: str  # 学年をStringに変更


class UserRead(BaseModel):
    id: int
    name: str
    grade: str
    results: List["UserResultRead"]  # UserResultReadのリストを追加

    class Config:
        orm_mode = True


class UserResultCreate(BaseModel):
    user_id: int
    date: datetime.date  # Dateフィールドを追加
    long_jump: float
    fifty_meter_run: float
    spider: float
    eight_shape_run: float
    ball_throw: float


class UserResultRead(BaseModel):
    id: int
    user_id: int
    date: datetime.date
    long_jump: float
    fifty_meter_run: float
    spider: float
    eight_shape_run: float
    ball_throw: float

    class Config:
        orm_mode = True


class AverageMaxDataBase(BaseModel):
    grade: str
    type: str
    long_jump: float
    fifty_meter_run: float
    spider: float
    eight_shape_run: float
    ball_throw: float
    total_score: float


class AverageMaxDataCreate(AverageMaxDataBase):
    pass


class AverageMaxDataRead(AverageMaxDataBase):
    id: int

    class Config:
        orm_mode = True


# データベースの作成
Base.metadata.create_all(bind=engine)  # テーブルを作成

# FastAPIアプリケーションの作成
app = FastAPI()

# CORSミドルウェアの設定
origins = [
    "http://localhost:3000",  # Reactアプリケーションのオリジン
    "http://localhost:8000",  # FastAPIアプリケーションのオリジン
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 許可するオリジン
    allow_credentials=True,  # クレデンシャルを許可するか
    allow_methods=["*"],  # 許可するHTTPメソッド
    allow_headers=["*"],  # 許可するHTTPヘッダー
)


# 依存性注入
def get_db():
    db = SessionLocal()  # セッションを作成
    try:
        yield db  # セッションをyield
    finally:
        db.close()  # セッションを閉じる


db_dependency = Annotated[Session, Depends(get_db)]  # 依存性


# APIエンドポイントの定義
@app.post("/users/", response_model=UserRead)  # POSTリクエストを受け付ける
async def create_user(user: UserCreate, db: db_dependency):
    db_user = User(**user.dict())  # データベースモデルを作成
    db.add(db_user)  # データベースに追加
    db.commit()  # コミット
    db.refresh(db_user)  # リフレッシュ
    return db_user  # ユーザーを返す


@app.get("/users/{user_id}", response_model=UserRead)  # GETリクエストを受け付ける
async def read_user(user_id: int, db: db_dependency):
    user = db.query(User).filter(User.id == user_id).first()  # ユーザーを取得
    if user is None:
        raise HTTPException(
            status_code=404, detail="User not found"
        )  # ユーザーが見つからない場合はエラーを返す
    # ユーザーに結果データが登録されていない場合に空のリストを返す
    if not user.results:
        user.results = []

    return user  # ユーザーを返す


@app.get("/users/", response_model=list[UserRead])  # GETリクエストを受け付ける
async def read_users(db: db_dependency, skip: int = 0, limit: int = 100):
    users = db.query(User).offset(skip).limit(limit).all()  # ユーザーを取得
    return users  # ユーザーを返す


@app.post("/user_results/", response_model=UserResultRead)
async def create_user_result(user_result: UserResultCreate, db: db_dependency):
    db_user_result = UserResult(**user_result.dict())
    db.add(db_user_result)
    db.commit()
    db.refresh(db_user_result)
    return db_user_result


@router.delete("/user_results/{result_id}")
async def delete_user_result(result_id: int, db: db_dependency):
    result = (
        db.query(UserResult).filter(UserResult.id == result_id).first()
    )  # models.UserResultを使用
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


app.include_router(router)
