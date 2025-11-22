"""
flexibility_checksテーブルからtrainingsテーブルへのデータ移行スクリプト

既存のflexibility_checksデータをtrainingsテーブルに移行します。
環境変数DATABASE_URLが設定されている場合はそれを使用し、
設定されていない場合はSQLiteを使用します。
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# 環境変数を読み込み
env_path = project_root / ".env"
load_dotenv(dotenv_path=env_path)

from backend.models import FlexibilityCheck, Training
from backend.enums import TrainingType
from backend.db import Base

# データベースの設定（環境変数から取得、なければSQLite）
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/test.db")

# SQLiteの場合はcheck_same_threadをFalseに設定
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def migrate_flexibility_to_trainings():
    """flexibility_checksからtrainingsへのデータ移行"""
    db = SessionLocal()
    try:
        # trainingsテーブルが存在しない場合は作成
        Base.metadata.create_all(bind=engine, tables=[Training.__table__])
        
        # 既存のflexibility_checksデータを取得
        flexibility_checks = db.query(FlexibilityCheck).all()
        
        if not flexibility_checks:
            print("移行するflexibility_checksデータがありません。")
            return
        
        migrated_count = 0
        for fc in flexibility_checks:
            # 既に移行済みかチェック（titleとtraining_typeで判定）
            existing = db.query(Training).filter(
                Training.title == fc.title,
                Training.training_type == TrainingType.FLEXIBILITY.value
            ).first()
            
            if existing:
                print(f"既に移行済み: {fc.title}")
                continue
            
            # Trainingレコードを作成
            training = Training(
                training_type=TrainingType.FLEXIBILITY.value,
                title=fc.title,
                image_path=fc.image_path,
                description=fc.description,
                instructions=None,  # 既存データにはinstructionsがないため
                created_at=fc.created_at,
                updated_at=fc.updated_at
            )
            db.add(training)
            migrated_count += 1
        
        db.commit()
        print(f"✅ 移行が完了しました！")
        print(f"   {migrated_count}件のデータをtrainingsテーブルに移行しました")
        
    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate_flexibility_to_trainings()

