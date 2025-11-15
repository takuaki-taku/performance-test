import os
import datetime
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Use environment variable first; fall back to local SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/test.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith(
        "sqlite") else {},
)

SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine
)

Base = declarative_base()


def ensure_schema() -> None:
    from . import models  # noqa: F401 - ensure models are imported

    # Migration logic for both SQLite and PostgreSQL
    is_sqlite = DATABASE_URL.startswith("sqlite")
    is_postgres = DATABASE_URL.startswith("postgresql")

    # Enumの値が数値のため、PostgreSQLのEnum型作成は不要
    # Integer型のカラムとして保存される

    # Create tables
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        if is_sqlite:
            # SQLite: Check and add firebase_uid to users table
            res = conn.execute(text("PRAGMA table_info(users)"))
            cols = [row[1] for row in res.fetchall()]
            if "firebase_uid" not in cols:
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN firebase_uid TEXT"))
                conn.execute(text(
                    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)"))

            # Check and add birthday to users table
            if "birthday" not in cols:
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN birthday DATE"))

            # Check and add new columns to user_results table
            res = conn.execute(text("PRAGMA table_info(user_results)"))
            result_cols = [row[1] for row in res.fetchall()]

            if "25m_run" not in result_cols:
                conn.execute(
                    text("ALTER TABLE user_results ADD COLUMN \"25m_run\" INTEGER"))

            if "serfece" not in result_cols:
                conn.execute(
                    text("ALTER TABLE user_results ADD COLUMN serfece INTEGER"))

            if "test_format" not in result_cols:
                conn.execute(
                    text("ALTER TABLE user_results ADD COLUMN test_format INTEGER"))

            conn.commit()

        elif is_postgres:
            # PostgreSQL: Check and add columns using information_schema
            # Check users table columns
            res = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND table_schema = 'public'
            """))
            cols = [row[0] for row in res.fetchall()]

            if "firebase_uid" not in cols:
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255)"))
                conn.execute(text(
                    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)"))

            if "birthday" not in cols:
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN birthday DATE"))

            # Check user_results table columns
            res = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'user_results' AND table_schema = 'public'
            """))
            result_cols = [row[0] for row in res.fetchall()]

            if "25m_run" not in result_cols:
                conn.execute(
                    text('ALTER TABLE user_results ADD COLUMN "25m_run" INTEGER'))

            if "serfece" not in result_cols:
                conn.execute(
                    text("ALTER TABLE user_results ADD COLUMN serfece INTEGER"))

            if "test_format" not in result_cols:
                conn.execute(
                    text("ALTER TABLE user_results ADD COLUMN test_format INTEGER"))

            conn.commit()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
