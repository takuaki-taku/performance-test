"""
Enum型のマイグレーションスクリプト

既存のPostgreSQLデータベースのEnum型を新しい値に更新します。
注意: このスクリプトは既存のEnum型を削除して再作成するため、
既存のデータがある場合は注意が必要です。
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/test.db")


def migrate_enums():
    """既存のEnum型を新しい値に更新"""
    if not DATABASE_URL.startswith("postgresql"):
        print("このスクリプトはPostgreSQLデータベース専用です。")
        return

    from backend.enums import SurfaceType, TestFormat

    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        # トランザクション開始
        trans = conn.begin()

        try:
            # 既存のEnum型を使用しているカラムを一時的に削除
            print("既存のEnum型を更新しています...")

            # surfacetype Enum型を削除して再作成
            # 注意: 既存のデータがある場合は、先にバックアップを取ることを推奨
            print("  - surfacetype Enum型を更新...")
            conn.execute(text("""
                DO $$ 
                BEGIN
                    -- 既存の型が存在する場合、依存関係を削除
                    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'surfacetype') THEN
                        -- カラムを一時的に削除（既存データがある場合は注意）
                        ALTER TABLE user_results DROP COLUMN IF EXISTS serfece;
                        DROP TYPE IF EXISTS surfacetype CASCADE;
                    END IF;
                END $$;
            """))

            # 新しいEnum型を作成
            enum_values = "', '".join([e.value for e in SurfaceType])
            conn.execute(
                text(f"CREATE TYPE surfacetype AS ENUM ('{enum_values}')"))

            # カラムを再追加
            conn.execute(text("""
                ALTER TABLE user_results 
                ADD COLUMN serfece surfacetype;
            """))

            # testformat Enum型を削除して再作成
            print("  - testformat Enum型を更新...")
            conn.execute(text("""
                DO $$ 
                BEGIN
                    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'testformat') THEN
                        ALTER TABLE user_results DROP COLUMN IF EXISTS test_format;
                        DROP TYPE IF EXISTS testformat CASCADE;
                    END IF;
                END $$;
            """))

            # 新しいEnum型を作成
            enum_values = "', '".join([e.value for e in TestFormat])
            conn.execute(
                text(f"CREATE TYPE testformat AS ENUM ('{enum_values}')"))

            # カラムを再追加
            conn.execute(text("""
                ALTER TABLE user_results 
                ADD COLUMN test_format testformat;
            """))

            trans.commit()
            print("✅ Enum型の更新が完了しました！")

        except Exception as e:
            trans.rollback()
            print(f"❌ エラーが発生しました: {e}")
            raise


if __name__ == "__main__":
    print("Enum型のマイグレーションを開始します...")
    print("警告: 既存のEnum型の値が変更されます。")
    response = input("続行しますか？ (yes/no): ")
    if response.lower() == "yes":
        migrate_enums()
    else:
        print("マイグレーションをキャンセルしました。")
