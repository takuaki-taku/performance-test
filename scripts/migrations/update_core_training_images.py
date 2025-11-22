"""
Core trainingの画像パスを更新するスクリプト

環境変数DATABASE_URLが設定されている場合はそれを使用し、
設定されていない場合はSQLiteを使用します。
"""
from backend.models import Training
from backend.enums import TrainingType
from backend.db import Base
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

# データベースの設定（環境変数から取得、なければSQLite）
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/test.db")

# SQLiteの場合はcheck_same_threadをFalseに設定
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Core trainingの画像パスマッピング
# トレーニングIDと画像ファイル名の対応
# ID 11-20がCore training
IMAGE_MAPPING_BY_ID = {
    11: "core training instraction copy.016.png",  # Plank (プランク) - ユーザー確認済み
    # Side Plank (サイドプランク) - 015.pngを使用（008と009は使用しない）
    12: "core training instraction copy.015.png",
    # Superman Back (手後ろスーパーマン) - ユーザー確認済み
    13: "core training instraction copy.001.png",
    # Superman Front (手前スーパーマン) - ユーザー確認済み
    14: "core training instraction copy.002.png",
    # Arm Circles (手を卍卍) - ユーザー確認済み
    15: "core training instraction copy.003.png",
    # Dead Bug (デッドバグ) - ユーザー確認済み
    16: "core training instraction copy.006.png",
    # Glute Squeeze (お尻キュっと) - ユーザー確認済み
    17: "core training instraction copy.010.png",
    # Knee Stand (膝立ち) - ユーザー確認済み
    18: "core training instraction copy.017.png",
    # Scapular Push-up (肩甲骨腕立て) - ユーザー確認済み
    19: "core training instraction copy.011.png",
    # Step-up (ステップアップ) - ユーザー確認済み
    20: "core training instraction copy.014.png",
}


def update_core_training_images():
    """Core trainingの画像パスを更新"""
    db = SessionLocal()
    try:
        updated_count = 0
        not_found_count = 0

        for training_id, image_filename in IMAGE_MAPPING_BY_ID.items():
            training = db.query(Training).filter(
                Training.id == training_id,
                Training.training_type == TrainingType.CORE.value
            ).first()

            if not training:
                print(f"⚠️  見つかりません: ID {training_id}")
                not_found_count += 1
                continue

            # 画像ファイルの存在確認（フロントエンドのpublicディレクトリ）
            image_path = f"/images/core/{image_filename}"
            image_file_path = project_root / "frontend" / \
                "public" / image_path.lstrip("/")

            if not image_file_path.exists():
                print(f"⚠️  画像ファイルが存在しません: {image_path}")
                print(f"   期待されるパス: {image_file_path}")
                not_found_count += 1
                continue

            # 画像パスを更新
            training.image_path = image_path
            updated_count += 1
            print(f"✅ 更新: ID {training_id} - {training.title} -> {image_path}")

        db.commit()
        print(f"\n✅ 更新が完了しました！")
        print(f"   更新: {updated_count}件")
        if not_found_count > 0:
            print(f"   見つからなかった/画像なし: {not_found_count}件")

    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    update_core_training_images()
