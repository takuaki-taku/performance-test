import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./backend/test.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

Base = declarative_base()


def ensure_schema() -> None:
    from . import models  # noqa: F401 - ensure models are imported
    Base.metadata.create_all(bind=engine)
    # SQLite 簡易マイグレーション: users に firebase_uid カラムが無ければ追加
    with engine.connect() as conn:
        res = conn.execute(text("PRAGMA table_info(users)"))
        cols = [row[1] for row in res.fetchall()]
        if "firebase_uid" not in cols:
            conn.execute(
                text("ALTER TABLE users ADD COLUMN firebase_uid TEXT"))
            conn.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)"))
            conn.commit()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
