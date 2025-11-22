from backend.models import AverageData, MaxData, User
from backend.main import Base
import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))


# データベースの設定
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def migrate_data():
    db = SessionLocal()
    try:
        # 既存のデータを削除
        db.query(AverageData).delete()
        db.query(MaxData).delete()
        db.query(User).delete()
        db.commit()

        # テストユーザーを作成
        test_user = User(
            name="テストユーザー",
            grade="2年女子"
        )
        db.add(test_user)
        db.commit()

        # 注意: average_max_dataテーブルは削除されました
        # データ移行は既に完了しているため、この処理は不要です
        # もしaverage_max_dataテーブルからデータを移行する必要がある場合は、
        # テーブルが存在することを確認してから実行してください

        # 変更をコミット
        db.commit()
        print("データの移行が完了しました。")

    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    migrate_data()
