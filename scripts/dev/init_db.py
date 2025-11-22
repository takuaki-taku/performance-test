import sys
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.main import Base
from backend.models import AverageData, MaxData, User, UserResult, FlexibilityCheck, Training
from backend.enums import TrainingType

# データベースの設定
DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_database():
    # データベースのテーブルを作成
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:     
        # 柔軟性チェックの初期データを追加
        flexibility_checks = [
            FlexibilityCheck(
                title='Bent forward',
                image_path='/images/flexibility/1.bent_forword.PNG',
                description='拳が地面につけばOK'
            ),
            FlexibilityCheck(
                title='Quad stretch',
                image_path='/images/flexibility/2.quad_stretch.PNG',
                description='お尻と踵の隙間が拳一個分以内ならOK'
            ),
            FlexibilityCheck(
                title='The split',
                image_path='/images/flexibility/3.the_split.PNG',
                description='肘が地面につけばOK\nおでこがつけばベリーグッド'
            ),
            FlexibilityCheck(
                title='Butterfly',
                image_path='/images/flexibility/4.butterfly.PNG',
                description='足裏合わせて、膝と地面が拳一個分以内ならOK'
            ),
            FlexibilityCheck(
                title='Spine twist',
                image_path='/images/flexibility/5.spine_twist.PNG',
                description='膝を揃えてつけながら、肩がつけばOK'
            ),
            FlexibilityCheck(
                title='Spine twist (失敗例)',
                image_path='/images/flexibility/5.5.spine_twist.PNG',
                description='膝を揃えてつけながら、肩がつけばOK'
            ),
            FlexibilityCheck(
                title='Shoulder flexibility',
                image_path='/images/flexibility/6.Shoulder_flexibility.PNG',
                description='後ろで手が組めるか両方\n※特に利き手が下の方'
            ),
            FlexibilityCheck(
                title='Bridge',
                image_path='/images/flexibility/7.bridge.PNG',
                description='ブリッジ'
            ),
            FlexibilityCheck(
                title='Ankle mobility(レベル0)',
                image_path='/images/flexibility/8.ankle.PNG',
                description='かかとをついたまましゃがめるか\nステップ1　手を前にしてOK\nステップ2　手を後ろで組む'
            ),
            FlexibilityCheck(
                title='Ankle mobility (レベル１)',
                image_path='/images/flexibility/8.5.ankle.PNG',
                description='かかとをついたまましゃがめるか\nステップ1　手を前にしてOK\nステップ2　手を後ろで組む'
            )
        ]
        
        for check in flexibility_checks:
            db.add(check)
        
        # Trainingテーブルにも同じデータを投入（flexibility_checksとの互換性のため）
        # 既存のTrainingデータがあるかチェック
        existing_trainings = db.query(Training).filter(
            Training.training_type == TrainingType.FLEXIBILITY.value
        ).count()
        
        if existing_trainings == 0:
            trainings = [
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='Bent forward',
                    image_path='/images/flexibility/1.bent_forword.PNG',
                    description='拳が地面につけばOK'
                ),
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='Quad stretch',
                    image_path='/images/flexibility/2.quad_stretch.PNG',
                    description='お尻と踵の隙間が拳一個分以内ならOK'
                ),
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='The split',
                    image_path='/images/flexibility/3.the_split.PNG',
                    description='肘が地面につけばOK\nおでこがつけばベリーグッド'
                ),
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='Butterfly',
                    image_path='/images/flexibility/4.butterfly.PNG',
                    description='足裏合わせて、膝と地面が拳一個分以内ならOK'
                ),
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='Spine twist',
                    image_path='/images/flexibility/5.spine_twist.PNG',
                    description='膝を揃えてつけながら、肩がつけばOK'
                ),
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='Spine twist (失敗例)',
                    image_path='/images/flexibility/5.5.spine_twist.PNG',
                    description='膝を揃えてつけながら、肩がつけばOK'
                ),
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='Shoulder flexibility',
                    image_path='/images/flexibility/6.Shoulder_flexibility.PNG',
                    description='後ろで手が組めるか両方\n※特に利き手が下の方'
                ),
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='Bridge',
                    image_path='/images/flexibility/7.bridge.PNG',
                    description='ブリッジ'
                ),
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='Ankle mobility(レベル0)',
                    image_path='/images/flexibility/8.ankle.PNG',
                    description='かかとをついたまましゃがめるか\nステップ1　手を前にしてOK\nステップ2　手を後ろで組む'
                ),
                Training(
                    training_type=TrainingType.FLEXIBILITY.value,
                    title='Ankle mobility (レベル１)',
                    image_path='/images/flexibility/8.5.ankle.PNG',
                    description='かかとをついたまましゃがめるか\nステップ1　手を前にしてOK\nステップ2　手を後ろで組む'
                )
            ]
            
            for training in trainings:
                db.add(training)
        
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