"""
Enum型をInteger型にマイグレーションするスクリプト

既存のPostgreSQLデータベースのEnum型をInteger型のカラムに変更します。
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/test.db")


def migrate_to_integer():
    """Enum型をInteger型に変更"""
    if not DATABASE_URL.startswith("postgresql"):
        print("このスクリプトはPostgreSQLデータベース専用です。")
        return

    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        trans = conn.begin()

        try:
            print("Enum型をInteger型にマイグレーション中...")

            # 1. 既存のカラムを一時的に削除（データは保持されません）
            print("  - 既存のEnum型カラムを削除...")
            conn.execute(text("""
                ALTER TABLE user_results 
                DROP COLUMN IF EXISTS serfece CASCADE;
            """))

            conn.execute(text("""
                ALTER TABLE user_results 
                DROP COLUMN IF EXISTS test_format CASCADE;
            """))

            # 2. Integer型のカラムを追加
            print("  - Integer型のカラムを追加...")
            conn.execute(text("""
                ALTER TABLE user_results 
                ADD COLUMN serfece INTEGER;
            """))

            conn.execute(text("""
                ALTER TABLE user_results 
                ADD COLUMN test_format INTEGER;
            """))

            # 3. 既存のEnum型を削除（使用されていない場合のみ）
            print("  - 古いEnum型を削除...")
            conn.execute(text("""
                DROP TYPE IF EXISTS surfacetype CASCADE;
            """))

            conn.execute(text("""
                DROP TYPE IF EXISTS testformat CASCADE;
            """))

            trans.commit()
            print("✅ マイグレーションが完了しました！")
            print("\n注意: 既存のEnum型のデータは削除されました。")
            print("新しいデータは数値（1, 2, 3など）で保存されます。")

        except Exception as e:
            trans.rollback()
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    print("=" * 60)
    print("Enum型をInteger型にマイグレーション")
    print("=" * 60)
    print("\n警告:")
    print("- 既存のserfeceとtest_formatカラムのデータは削除されます")
    print("- カラムはInteger型に変更されます")
    print("\n続行しますか？")
    response = input("(yes/no): ")
    if response.lower() == "yes":
        migrate_to_integer()
    else:
        print("マイグレーションをキャンセルしました。")
