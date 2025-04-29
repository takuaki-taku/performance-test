from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import Base, AverageMaxData, AverageData, MaxData, User

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
        
        # 既存のAverageMaxDataを取得
        existing_data = db.query(AverageMaxData).all()
        
        for data in existing_data:
            # 平均値データの作成
            if data.type == "平均値":
                average_data = AverageData(
                    grade=data.grade,
                    long_jump_cm=data.long_jump_cm,
                    fifty_meter_run_ms=data.fifty_meter_run_ms,
                    spider_ms=data.spider_ms,
                    eight_shape_run_count=data.eight_shape_run_count,
                    ball_throw_cm=data.ball_throw_cm,
                    total_score=data.total_score
                )
                db.add(average_data)
            
            # 最大値データの作成
            elif data.type == "最高値":
                max_data = MaxData(
                    grade=data.grade,
                    long_jump_cm=data.long_jump_cm,
                    fifty_meter_run_ms=data.fifty_meter_run_ms,
                    spider_ms=data.spider_ms,
                    eight_shape_run_count=data.eight_shape_run_count,
                    ball_throw_cm=data.ball_throw_cm,
                    total_score=data.total_score
                )
                db.add(max_data)
        
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