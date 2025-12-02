"""
Enum定義ファイル

データベースモデルやAPIスキーマで使用するEnum型を定義します。
"""
import enum


class SurfaceType(enum.Enum):
    """テニスコートのサーフェスタイプのEnum"""
    ARTIFICIAL_GRASS = 1  # 人工芝
    HARD = 2  # ハード
    CLAY = 3  # クレー


class TestFormat(enum.Enum):
    """テスト形式のEnum"""
    NATIONAL = 1  # 全国大会
    REGIONAL = 2  # 地域大会


class TrainingType(enum.Enum):
    """トレーニング種別のEnum"""
    FLEXIBILITY = 1  # ストレッチ/柔軟性
    CORE = 2  # コアトレーニング
    STRENGTH = 3  # 筋トレ
    LADDER = 4  # ラダートレーニング
    WARMUP = 5  # ウォームアップ
    COOLDOWN = 6  # クールダウン


class AchievementLevel(enum.Enum):
    """達成度レベルのEnum（4段階）

    4 は「評価はまだだが、このトレーニングに取り組み始めた」という状態を表す。
    """
    NEEDS_IMPROVEMENT = 1  # 要改善
    ACHIEVED = 2          # 達成
    EXCELLENT = 3         # 優秀
    STARTED_NO_EVAL = 4   # 評価なし（取り組み開始のみ）
