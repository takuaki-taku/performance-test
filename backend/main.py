from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.db import ensure_schema
from backend.routers import me as me_router
from backend.routers import users as users_router
from backend.routers import stats as stats_router
from backend.routers import flexibility as flexibility_router


# Initialize DB schema (idempotent)
ensure_schema()


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
    db_check = db.query(FlexibilityCheck).filter(FlexibilityCheck.id == check_id).first()
    if db_check is None:
        raise HTTPException(status_code=404, detail="Flexibility check not found")
    
    for key, value in check.model_dump().items():
        setattr(db_check, key, value)
    
    db.commit()
    db.refresh(db_check)
    return db_check

@app.delete("/flexibility-checks/{check_id}")
def delete_flexibility_check(check_id: int, db: Session = Depends(get_db)):
    db_check = db.query(FlexibilityCheck).filter(FlexibilityCheck.id == check_id).first()
    if db_check is None:
        raise HTTPException(status_code=404, detail="Flexibility check not found")
    
    db.delete(db_check)
    db.commit()
    return {"message": "Flexibility check deleted successfully"}

app.include_router(router)
