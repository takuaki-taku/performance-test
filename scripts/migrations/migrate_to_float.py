"""
テスト結果カラムをFloat型にマイグレーションするスクリプト

既存のPostgreSQLデータベースのテスト結果カラムをInteger型からFloat型に変更します。
"""
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/test.db")


def migrate_to_float():
    """テスト結果カラムをFloat型に変更"""
    if not DATABASE_URL.startswith("postgresql"):
        print("このスクリプトはPostgreSQLデータベース専用です。")
        return

    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        trans = conn.begin()

        try:
            print("テスト結果カラムをFloat型にマイグレーション中...")

            # テスト結果カラムをFloat型に変更
            columns_to_migrate = [
                "long_jump_cm",
                "fifty_meter_run_ms",
                "spider_ms",
                "eight_shape_run_count",
                "ball_throw_cm",
                "25m_run"
            ]

            for column in columns_to_migrate:
                # カラム名に特殊文字がある場合は引用符で囲む
                column_name = f'"{column}"' if column.startswith(
                    "25") else column
                print(f"  - {column} をFloat型に変更...")
                conn.execute(text(f"""
                    ALTER TABLE user_results 
                    ALTER COLUMN {column_name} TYPE DOUBLE PRECISION
                    USING {column_name}::DOUBLE PRECISION;
                """))

            trans.commit()
            print("✅ マイグレーションが完了しました！")
            print("\nテスト結果カラムはFloat型になりました。")
            print("小数点を含む値も保存できるようになりました。")

        except Exception as e:
            trans.rollback()
            print(f"❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            raise


if __name__ == "__main__":
    print("=" * 60)
    print("テスト結果カラムをFloat型にマイグレーション")
    print("=" * 60)
    print("\n変更されるカラム:")
    print("  - long_jump_cm")
    print("  - fifty_meter_run_ms")
    print("  - spider_ms")
    print("  - eight_shape_run_count")
    print("  - ball_throw_cm")
    print("  - 25m_run")
    print("\n続行しますか？")
    response = input("(yes/no): ")
    if response.lower() == "yes":
        migrate_to_float()
    else:
        print("マイグレーションをキャンセルしました。")
