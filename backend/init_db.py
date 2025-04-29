from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import Base, AverageData, MaxData, User, UserResult
import datetime

# データベースの設定
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_database():
    # データベースのテーブルを作成
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 既存のデータを削除
        db.query(UserResult).delete()
        db.query(User).delete()
        db.query(AverageData).delete()
        db.query(MaxData).delete()
        
        # テストユーザーを作成
        test_user = User(
            name="テストユーザー",
            grade="2年女子"
        )
        db.add(test_user)
        db.commit()
        
        # テストユーザーの結果を追加
        test_results = [
            UserResult(
                user_id=test_user.id,
                date=datetime.date(2024, 1, 15),
                long_jump_cm=180,
                fifty_meter_run_ms=8500,
                spider_ms=9000,
                eight_shape_run_count=25,
                ball_throw_cm=1500
            ),
            UserResult(
                user_id=test_user.id,
                date=datetime.date(2024, 2, 15),
                long_jump_cm=185,
                fifty_meter_run_ms=8300,
                spider_ms=8800,
                eight_shape_run_count=27,
                ball_throw_cm=1600
            )
        ]
        for result in test_results:
            db.add(result)
        
        # 平均データを追加
        average_data = AverageData(
            grade="2年女子",
            long_jump_cm=170,
            fifty_meter_run_ms=9000,
            spider_ms=9500,
            eight_shape_run_count=20,
            ball_throw_cm=1300,
            total_score=None
        )
        db.add(average_data)
        
        # 最大データを追加
        max_data = MaxData(
            grade="2年女子",
            long_jump_cm=200,
            fifty_meter_run_ms=7500,
            spider_ms=8000,
            eight_shape_run_count=30,
            ball_throw_cm=2000,
            total_score=None
        )
        db.add(max_data)
        
        # 変更をコミット
        db.commit()
        print("初期データの投入が完了しました。")
        
    except Exception as e:
        db.rollback()
        print(f"エラーが発生しました: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_database() 