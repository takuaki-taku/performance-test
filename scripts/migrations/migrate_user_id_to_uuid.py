"""
既存のUser.idをInteger型からUUID型にマイグレーションするスクリプト

既存のPostgreSQL/SQLiteデータベースのUser.idをInteger型からUUID型に変更します。
既存のユーザーには新しいUUIDが割り当てられ、user_resultsのuser_idも更新されます。
"""
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

# Load environment variables
env_path = Path(__file__).parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/test.db")


def migrate_user_id_to_uuid():
    """User.idをInteger型からUUID型に変更"""
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    is_sqlite = DATABASE_URL.startswith("sqlite")
    is_postgres = DATABASE_URL.startswith("postgresql")

    if not (is_sqlite or is_postgres):
        print("❌ このスクリプトはSQLiteまたはPostgreSQLのみをサポートしています")
        return

    print("🔄 User.idをUUID型にマイグレーション開始...")
    print(f"   データベース: {'SQLite' if is_sqlite else 'PostgreSQL'}")

    with engine.connect() as conn:
        # トランザクション開始
        trans = conn.begin()

        try:
            # 1. 既存のユーザーを取得
            if is_sqlite:
                users = conn.execute(
                    text("SELECT id, name FROM users")).fetchall()
            else:
                users = conn.execute(
                    text("SELECT id, name FROM users")).fetchall()

            if not users:
                print("ℹ️  移行するユーザーがありません")
                trans.commit()
                return

            print(f"   移行対象ユーザー数: {len(users)}")

            # 2. 一時的なUUIDカラムを追加
            if is_sqlite:
                # SQLite: 新しいテーブルを作成してデータを移行
                print("   SQLite: 新しいテーブル構造を作成中...")

                # 既存のuser_resultsのuser_idを一時的に保存
                conn.execute(text("""
                    CREATE TABLE IF NOT EXISTS user_results_backup AS
                    SELECT * FROM user_results
                """))

                # 新しいusersテーブルを作成
                conn.execute(text("DROP TABLE IF EXISTS users_new"))
                conn.execute(text("""
                    CREATE TABLE users_new (
                        id TEXT PRIMARY KEY,
                        name TEXT,
                        grade TEXT,
                        firebase_uid TEXT UNIQUE,
                        birthday DATE
                    )
                """))

                # 既存のユーザーにUUIDを割り当てて移行
                id_mapping = {}  # old_id -> new_uuid
                for old_id, name in users:
                    new_uuid = str(uuid.uuid4())
                    id_mapping[old_id] = new_uuid

                    # ユーザー情報を取得
                    user_data = conn.execute(
                        text(
                            "SELECT name, grade, firebase_uid, birthday FROM users WHERE id = :id"),
                        {"id": old_id}
                    ).fetchone()

                    if user_data:
                        conn.execute(
                            text("""
                                INSERT INTO users_new (id, name, grade, firebase_uid, birthday)
                                VALUES (:id, :name, :grade, :firebase_uid, :birthday)
                            """),
                            {
                                "id": new_uuid,
                                "name": user_data[0],
                                "grade": user_data[1],
                                "firebase_uid": user_data[2],
                                "birthday": user_data[3]
                            }
                        )

                # 古いテーブルを削除して新しいテーブルにリネーム
                conn.execute(text("DROP TABLE IF EXISTS users_old"))
                conn.execute(text("ALTER TABLE users RENAME TO users_old"))
                conn.execute(text("ALTER TABLE users_new RENAME TO users"))

                # user_resultsのuser_idを更新
                print("   user_resultsのuser_idを更新中...")
                conn.execute(text("DROP TABLE IF EXISTS user_results_old"))
                conn.execute(
                    text("ALTER TABLE user_results RENAME TO user_results_old"))

                # 新しいuser_resultsテーブルを作成
                conn.execute(text("""
                    CREATE TABLE user_results (
                        id INTEGER PRIMARY KEY,
                        user_id TEXT NOT NULL,
                        date DATE NOT NULL,
                        long_jump_cm REAL NOT NULL,
                        fifty_meter_run_ms REAL NOT NULL,
                        spider_ms REAL NOT NULL,
                        eight_shape_run_count REAL NOT NULL,
                        ball_throw_cm REAL NOT NULL,
                        "25m_run" REAL,
                        serfece INTEGER,
                        test_format INTEGER,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                """))

                # バックアップからデータを復元（user_idをUUIDに変換）
                old_results = conn.execute(
                    text("SELECT * FROM user_results_old")).fetchall()
                for result in old_results:
                    old_user_id = result[1]  # user_id
                    new_user_id = id_mapping.get(old_user_id)
                    if new_user_id:
                        conn.execute(
                            text("""
                                INSERT INTO user_results 
                                (id, user_id, date, long_jump_cm, fifty_meter_run_ms, 
                                 spider_ms, eight_shape_run_count, ball_throw_cm, "25m_run", 
                                 serfece, test_format)
                                VALUES (:id, :user_id, :date, :long_jump_cm, :fifty_meter_run_ms,
                                        :spider_ms, :eight_shape_run_count, :ball_throw_cm, 
                                        :25m_run, :serfece, :test_format)
                            """),
                            {
                                "id": result[0],
                                "user_id": new_user_id,
                                "date": result[2],
                                "long_jump_cm": result[3],
                                "fifty_meter_run_ms": result[4],
                                "spider_ms": result[5],
                                "eight_shape_run_count": result[6],
                                "ball_throw_cm": result[7],
                                "25m_run": result[8] if len(result) > 8 else None,
                                "serfece": result[9] if len(result) > 9 else None,
                                "test_format": result[10] if len(result) > 10 else None
                            }
                        )

                # インデックスを再作成
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS idx_user_results_user_id ON user_results(user_id)"))
                conn.execute(
                    text("CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)"))

            else:
                # PostgreSQL: ALTER TABLEで直接変更
                print("   PostgreSQL: UUID型に変更中...")

                # 1. 一時的なUUIDカラムを追加
                conn.execute(
                    text("ALTER TABLE users ADD COLUMN IF NOT EXISTS id_new UUID"))

                # 2. 既存のユーザーにUUIDを割り当て
                print("   - 既存のユーザーにUUIDを割り当て中...")
                id_mapping = {}  # old_id -> new_uuid
                for old_id, name in users:
                    new_uuid = uuid.uuid4()
                    id_mapping[old_id] = new_uuid
                    conn.execute(
                        text("UPDATE users SET id_new = :new_uuid WHERE id = :old_id"),
                        {"new_uuid": new_uuid, "old_id": old_id}
                    )

                # 3. user_resultsのuser_idを一時カラムに保存
                print("   - user_resultsのuser_idを更新中...")
                conn.execute(
                    text("ALTER TABLE user_results ADD COLUMN IF NOT EXISTS user_id_new UUID"))

                for old_id, new_uuid in id_mapping.items():
                    conn.execute(
                        text(
                            "UPDATE user_results SET user_id_new = :new_uuid WHERE user_id = :old_id"),
                        {"new_uuid": new_uuid, "old_id": old_id}
                    )

                # 4. 外部キー制約を削除（一時的）
                print("   - 外部キー制約を一時的に削除...")
                conn.execute(text(
                    "ALTER TABLE user_results DROP CONSTRAINT IF EXISTS user_results_user_id_fkey"))

                # 5. 古いカラムを削除して新しいカラムにリネーム
                print("   - カラムを更新中...")
                conn.execute(
                    text("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey"))
                conn.execute(
                    text("ALTER TABLE users DROP COLUMN IF EXISTS id"))
                conn.execute(
                    text("ALTER TABLE users RENAME COLUMN id_new TO id"))
                conn.execute(text("ALTER TABLE users ADD PRIMARY KEY (id)"))

                conn.execute(
                    text("ALTER TABLE user_results DROP COLUMN IF EXISTS user_id"))
                conn.execute(
                    text("ALTER TABLE user_results RENAME COLUMN user_id_new TO user_id"))

                # 6. 外部キー制約を再作成（データ整合性を保証）
                print("   - 外部キー制約を再作成中...")
                conn.execute(text("""
                    ALTER TABLE user_results 
                    ADD CONSTRAINT user_results_user_id_fkey 
                    FOREIGN KEY (user_id) REFERENCES users(id)
                    ON DELETE CASCADE
                """))

                # 7. インデックスを再作成
                print("   - インデックスを再作成中...")
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS idx_user_results_user_id ON user_results(user_id)"))
                conn.execute(text(
                    "CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid)"))

            trans.commit()
            print("✅ マイグレーションが完了しました！")
            print(f"   {len(users)}人のユーザーがUUIDに移行されました")

        except Exception as e:
            trans.rollback()
            print(f"❌ エラーが発生しました: {e}")
            raise


if __name__ == "__main__":
    migrate_user_id_to_uuid()
