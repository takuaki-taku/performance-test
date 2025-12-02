"""
trainingsテーブルにシリーズ情報カラムを追加するマイグレーションスクリプト

既存のtrainingsテーブルに以下のカラムを追加します:
- series_name: String (nullable)
- series_number: Integer (nullable)
- page_number: Integer (nullable)

使用方法:
    python scripts/migrations/add_series_fields_to_trainings.py
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

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


def add_series_fields():
    """trainingsテーブルにシリーズ情報カラムを追加"""
    print("🔄 trainingsテーブルにシリーズ情報カラムを追加中...")
    
    with engine.connect() as conn:
        # トランザクション開始
        trans = conn.begin()
        
        try:
            # データベースタイプを判定
            db_type = DATABASE_URL.split("://")[0] if "://" in DATABASE_URL else "sqlite"
            # postgresql+psycopg:// のような形式にも対応
            if db_type.startswith("postgresql"):
                db_type = "postgresql"
            
            if db_type == "sqlite":
                # SQLiteの場合
                # カラムが存在するかチェック（SQLiteでは直接チェックできないため、エラーをキャッチ）
                try:
                    conn.execute(text("SELECT series_name FROM trainings LIMIT 1"))
                    print("✅ カラムは既に存在します")
                    trans.rollback()
                    return
                except Exception:
                    # カラムが存在しない場合は追加
                    pass
                
                conn.execute(text("""
                    ALTER TABLE trainings 
                    ADD COLUMN series_name VARCHAR
                """))
                conn.execute(text("""
                    ALTER TABLE trainings 
                    ADD COLUMN series_number INTEGER
                """))
                conn.execute(text("""
                    ALTER TABLE trainings 
                    ADD COLUMN page_number INTEGER
                """))
                
            elif db_type == "postgresql":
                # PostgreSQLの場合
                # カラムが存在するかチェックしてから追加
                conn.execute(text("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_name='trainings' AND column_name='series_name'
                        ) THEN
                            ALTER TABLE trainings ADD COLUMN series_name VARCHAR;
                        END IF;
                    END $$;
                """))
                
                conn.execute(text("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_name='trainings' AND column_name='series_number'
                        ) THEN
                            ALTER TABLE trainings ADD COLUMN series_number INTEGER;
                        END IF;
                    END $$;
                """))
                
                conn.execute(text("""
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_name='trainings' AND column_name='page_number'
                        ) THEN
                            ALTER TABLE trainings ADD COLUMN page_number INTEGER;
                        END IF;
                    END $$;
                """))
                
                # インデックスを追加
                try:
                    conn.execute(text("CREATE INDEX IF NOT EXISTS idx_trainings_series_name ON trainings(series_name)"))
                    conn.execute(text("CREATE INDEX IF NOT EXISTS idx_trainings_series_number ON trainings(series_number)"))
                except Exception as e:
                    print(f"⚠️  インデックスの作成でエラー（既に存在する可能性があります）: {e}")
            
            trans.commit()
            print("✅ カラムの追加が完了しました！")
            print("   - series_name")
            print("   - series_number")
            print("   - page_number")
            
        except Exception as e:
            trans.rollback()
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    add_series_fields()

