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
