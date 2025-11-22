"""
Core trainingデータをtrainingsテーブルに投入するスクリプト

環境変数DATABASE_URLが設定されている場合はそれを使用し、
設定されていない場合はSQLiteを使用します。
"""
from backend.db import Base
from backend.enums import TrainingType
from backend.models import Training
import os
import sys
import json
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


# データベースの設定（環境変数から取得、なければSQLite）
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/test.db")

# SQLiteの場合はcheck_same_threadをFalseに設定
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def insert_core_trainings():
    """Core trainingデータをtrainingsテーブルに投入"""
    db = SessionLocal()
    try:
        # trainingsテーブルが存在しない場合は作成
        Base.metadata.create_all(bind=engine, tables=[Training.__table__])

        # JSONファイルを読み込み
        json_path = project_root / "docs" / "core-training-data.json"
        with open(json_path, 'r', encoding='utf-8') as f:
            trainings_data = json.load(f)

        inserted_count = 0
        skipped_count = 0

        for training_data in trainings_data:
            # 既に同じタイトルのトレーニングが存在するかチェック
            existing = db.query(Training).filter(
                Training.title == training_data['title'],
                Training.training_type == training_data['training_type']
            ).first()

            if existing:
                print(f"⏭️  スキップ: {training_data['title']} (既に存在)")
                skipped_count += 1
                continue

            # Trainingレコードを作成
            training = Training(
                training_type=training_data['training_type'],
                title=training_data['title'],
                image_path=training_data.get('image_path'),
                description=training_data['description'],
                instructions=training_data.get('instructions')
            )
            db.add(training)
            inserted_count += 1
            print(f"✅ 追加: {training_data['title']}")

        db.commit()
        print(f"\n✅ 投入が完了しました！")
        print(f"   追加: {inserted_count}件")
        print(f"   スキップ: {skipped_count}件")

    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    insert_core_trainings()
