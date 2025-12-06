#!/usr/bin/env python3
"""フィードバックデータの確認スクリプト"""

import os
import sys
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# プロジェクトルートをパスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.db import DATABASE_URL, engine


def check_data():
    """データベースの状態を確認"""
    from backend.db import SessionLocal

    session = SessionLocal()

    try:
        print("=" * 80)
        print("1. ユーザーのトレーニング結果を確認")
        print("=" * 80)

        # ユーザーIDを指定（ログから）
        user_id = "7fa7e823-43d2-4955-b981-f6eaf8402d07"
        training_id = 1

        # トレーニング結果を取得
        result = session.execute(
            text(
                """
                SELECT id, user_id, training_id, date, achievement_level, comment, created_at
                FROM user_training_results
                WHERE user_id = :user_id AND training_id = :training_id
                ORDER BY date DESC
            """
            ),
            {"user_id": user_id, "training_id": training_id},
        )

        results = result.fetchall()
        print(f"\nユーザー {user_id} のトレーニング {training_id} の結果:")
        print(f"  件数: {len(results)}")

        for r in results:
            print(f"\n  - ID: {r[0]}")
            print(f"    日付: {r[3]} (型: {type(r[3])})")
            print(f"    評価レベル: {r[4]}")
            print(f"    コメント: {r[5]}")
            print(f"    作成日時: {r[6]}")

        # 今日の日付
        today = datetime.now().date()
        print(f"\n今日の日付: {today} (型: {type(today)})")

        # 今日の結果を探す
        today_results = [r for r in results if r[3] == today]
        print(f"\n今日の結果: {len(today_results)}件")
        if today_results:
            for r in today_results:
                print(f"  - 結果ID: {r[0]}")

        print("\n" + "=" * 80)
        print("2. フィードバックメッセージを確認")
        print("=" * 80)

        if results:
            result_ids = [r[0] for r in results]
            print(f"\n結果ID一覧: {result_ids}")

            # フィードバックメッセージを取得
            feedback_result = session.execute(
                text(
                    """
                    SELECT id, user_training_result_id, sender_type, sender_id, message, 
                           message_type, created_at, read_at
                    FROM training_feedback_messages
                    WHERE user_training_result_id = ANY(:result_ids)
                    ORDER BY created_at ASC
                """
                ),
                {"result_ids": result_ids},
            )

            feedbacks = feedback_result.fetchall()
            print(f"\nフィードバックメッセージ: {len(feedbacks)}件")

            for f in feedbacks:
                print(f"\n  - メッセージID: {f[0]}")
                print(f"    結果ID: {f[1]}")
                print(f"    送信者タイプ: {f[2]}")
                print(f"    送信者ID: {f[3]}")
                print(
                    f"    メッセージ: {f[4][:50]}..."
                    if len(f[4]) > 50
                    else f"    メッセージ: {f[4]}"
                )
                print(f"    メッセージタイプ: {f[5]}")
                print(f"    作成日時: {f[6]}")
                print(f"    既読日時: {f[7]}")
        else:
            print(
                "\nトレーニング結果がないため、フィードバックメッセージを確認できません"
            )

        print("\n" + "=" * 80)
        print("3. 全ユーザーのトレーニング結果（最新5件）")
        print("=" * 80)

        all_results = session.execute(
            text(
                """
                SELECT id, user_id, training_id, date, achievement_level, created_at
                FROM user_training_results
                ORDER BY created_at DESC
                LIMIT 5
            """
            )
        )

        all = all_results.fetchall()
        print(f"\n最新5件のトレーニング結果:")
        for r in all:
            user_id_str = str(r[1])[:8] if r[1] else "None"
            print(
                f"  - ID: {r[0]}, ユーザー: {user_id_str}..., トレーニング: {r[2]}, 日付: {r[3]}, 評価: {r[4]}, 作成: {r[5]}"
            )

        print("\n" + "=" * 80)
        print("4. 全フィードバックメッセージ（最新5件）")
        print("=" * 80)

        all_feedbacks = session.execute(
            text(
                """
                SELECT id, user_training_result_id, sender_type, message, created_at
                FROM training_feedback_messages
                ORDER BY created_at DESC
                LIMIT 5
            """
            )
        )

        all_f = all_feedbacks.fetchall()
        print(f"\n最新5件のフィードバックメッセージ:")
        for f in all_f:
            print(
                f"  - ID: {f[0]}, 結果ID: {f[1]}, 送信者: {f[2]}, メッセージ: {f[3][:30]}..., 作成: {f[4]}"
            )

    finally:
        session.close()


if __name__ == "__main__":
    check_data()
