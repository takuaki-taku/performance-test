"""
ウォームアップとクールダウンのトレーニングデータをDBに投入するスクリプト

変換済みのPNG画像ファイルを読み込み、trainingsテーブルにデータを投入します。

使用方法:
    python scripts/migrations/insert_warmup_cooldown_trainings.py

前提条件:
    - convert_pdf_to_png.py を実行してPNG画像を生成済みであること
    - データベースが初期化されていること
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

from backend.models import Training, Base
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


def parse_filename(filename: str):
    """
    ファイル名からシリーズ情報を抽出
    
    例: "クールダウン_series1_page001.png" -> {
        "series_name": "クールダウン",
        "series_number": 1,
        "page_number": 1
    }
    """
    # 拡張子を除去
    name_without_ext = filename.replace(".png", "").replace(".PNG", "")
    
    # _series と _page で分割
    parts = name_without_ext.split("_series")
    if len(parts) != 2:
        return None
    
    series_name = parts[0]
    
    # series_number と page_number を抽出
    series_and_page = parts[1].split("_page")
    if len(series_and_page) != 2:
        return None
    
    try:
        series_number = int(series_and_page[0])
        page_number = int(series_and_page[1])
    except ValueError:
        return None
    
    return {
        "series_name": series_name,
        "series_number": series_number,
        "page_number": page_number,
    }


def insert_trainings_from_images():
    """PNG画像ファイルからトレーニングデータを投入"""
    db = SessionLocal()
    try:
        # trainingsテーブルが存在しない場合は作成
        Base.metadata.create_all(bind=engine, tables=[Training.__table__])
        
        images_dir = project_root / "frontend" / "public" / "images"
        
        # カテゴリごとに処理
        categories = [
            {
                "dir": images_dir / "warmup",
                "training_type": TrainingType.WARMUP.value,
                "default_description": "ウォームアップトレーニング",
            },
            {
                "dir": images_dir / "cooldown",
                "training_type": TrainingType.COOLDOWN.value,
                "default_description": "クールダウントレーニング",
            },
        ]
        
        inserted_count = 0
        skipped_count = 0
        
        for category_info in categories:
            category_dir = category_info["dir"]
            training_type = category_info["training_type"]
            default_description = category_info["default_description"]
            
            if not category_dir.exists():
                print(f"⚠️  ディレクトリが存在しません: {category_dir}")
                continue
            
            print(f"\n{'='*60}")
            print(f"処理中: {category_dir.name}")
            print(f"{'='*60}")
            
            # PNGファイルを取得
            png_files = sorted(category_dir.glob("*.png")) + sorted(category_dir.glob("*.PNG"))
            
            if not png_files:
                print(f"⚠️  PNGファイルが見つかりません: {category_dir}")
                continue
            
            for png_file in png_files:
                # ファイル名から情報を抽出
                file_info = parse_filename(png_file.name)
                
                if not file_info:
                    print(f"⚠️  ファイル名の解析に失敗: {png_file.name}")
                    skipped_count += 1
                    continue
                
                series_name = file_info["series_name"]
                series_number = file_info["series_number"]
                page_number = file_info["page_number"]
                
                # 画像パス（フロントエンドから見たパス）
                image_path = f"/images/{category_dir.name}/{png_file.name}"
                
                # タイトルを生成（例: "クールダウン シリーズ1 - ページ1"）
                title = f"{series_name} シリーズ{series_number} - ページ{page_number}"
                
                # 既に同じトレーニングが存在するかチェック
                existing = db.query(Training).filter(
                    Training.training_type == training_type,
                    Training.series_name == series_name,
                    Training.series_number == series_number,
                    Training.page_number == page_number,
                ).first()
                
                if existing:
                    print(f"⏭️  スキップ: {title} (既に存在)")
                    skipped_count += 1
                    continue
                
                # Trainingレコードを作成
                training = Training(
                    training_type=training_type,
                    title=title,
                    image_path=image_path,
                    description=default_description,
                    instructions=None,
                    series_name=series_name,
                    series_number=series_number,
                    page_number=page_number,
                )
                
                db.add(training)
                inserted_count += 1
                print(f"✅ 追加: {title}")
        
        db.commit()
        print(f"\n{'='*60}")
        print(f"✅ 投入が完了しました！")
        print(f"   追加: {inserted_count}件")
        print(f"   スキップ: {skipped_count}件")
        print(f"{'='*60}")
    
    except Exception as e:
        db.rollback()
        print(f"❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    insert_trainings_from_images()

