"""
DBに投入されたウォームアップ/クールダウンのデータを確認するスクリプト

使用方法:
    python scripts/migrations/check_warmup_cooldown_data.py
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

from backend.models import Training
from backend.enums import TrainingType

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


def check_data():
    """DBに投入されたデータを確認"""
    db = SessionLocal()
    try:
        # ウォームアップとクールダウンのデータを取得
        warmup_trainings = db.query(Training).filter(
            Training.training_type == TrainingType.WARMUP.value
        ).order_by(Training.series_number, Training.page_number).all()
        
        cooldown_trainings = db.query(Training).filter(
            Training.training_type == TrainingType.COOLDOWN.value
        ).order_by(Training.series_number, Training.page_number).all()
        
        print("=" * 80)
        print("📊 DBに投入されたデータ一覧")
        print("=" * 80)
        
        print(f"\n🔥 ウォームアップ: {len(warmup_trainings)}件")
        print("-" * 80)
        for training in warmup_trainings:
            print(f"  ID: {training.id}")
            print(f"  タイトル: {training.title}")
            print(f"  シリーズ名: {training.series_name}")
            print(f"  シリーズ番号: {training.series_number}")
            print(f"  ページ番号: {training.page_number}")
            print(f"  画像パス: {training.image_path}")
            print(f"  説明: {training.description}")
            print()
        
        print(f"\n❄️  クールダウン: {len(cooldown_trainings)}件")
        print("-" * 80)
        for training in cooldown_trainings:
            print(f"  ID: {training.id}")
            print(f"  タイトル: {training.title}")
            print(f"  シリーズ名: {training.series_name}")
            print(f"  シリーズ番号: {training.series_number}")
            print(f"  ページ番号: {training.page_number}")
            print(f"  画像パス: {training.image_path}")
            print(f"  説明: {training.description}")
            print()
        
        print("=" * 80)
        print(f"✅ 合計: {len(warmup_trainings) + len(cooldown_trainings)}件")
        print("=" * 80)
        
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    check_data()

