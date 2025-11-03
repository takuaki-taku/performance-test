import os
from typing import Type

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from backend.models import User, UserResult, AverageData, MaxData, AverageMaxData, FlexibilityCheck
from backend.db import Base


SOURCE_URL = os.getenv("SOURCE_DATABASE_URL", "sqlite:///./backend/test.db")
TARGET_URL = os.getenv("TARGET_DATABASE_URL")

if not TARGET_URL:
    raise SystemExit(
        "TARGET_DATABASE_URL is required (e.g. postgresql+psycopg://...)")


def copy_table(session_src: Session, session_dst: Session, model: Type[Base]):
    rows = session_src.query(model).all()
    for row in rows:
        data = {c.name: getattr(row, c.name) for c in model.__table__.columns}
        session_dst.merge(model(**data))


def main() -> None:
    engine_src = create_engine(SOURCE_URL)
    engine_dst = create_engine(TARGET_URL)

    # ensure target schema exists
    Base.metadata.create_all(bind=engine_dst)

    with Session(engine_src) as src, Session(engine_dst) as dst:
        try:
            copy_table(src, dst, User)
            copy_table(src, dst, UserResult)
            copy_table(src, dst, AverageData)
            copy_table(src, dst, MaxData)
            copy_table(src, dst, AverageMaxData)
            copy_table(src, dst, FlexibilityCheck)
            dst.commit()
            print("Migration completed successfully")
        except Exception as e:
            dst.rollback()
            raise


if __name__ == "__main__":
    main()
