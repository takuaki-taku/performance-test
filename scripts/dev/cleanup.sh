#!/bin/bash
# 開発環境のクリーンアップスクリプト

set -e

echo "🧹 開発環境のクリーンアップを開始します..."
echo ""

# プロジェクトルートに移動
cd "$(dirname "$0")/../.."

# 1. 仮想環境の整理（.venvとvenvの両方がある場合）
if [ -d "backend/.venv" ] && [ -d "backend/venv" ]; then
    echo "⚠️  仮想環境が2つ見つかりました:"
    echo "  - backend/.venv"
    echo "  - backend/venv"
    echo ""
    echo "どちらを残しますか？"
    echo "1) .venv を残す（venv を削除）"
    echo "2) venv を残す（.venv を削除）"
    echo "3) 両方削除"
    read -p "選択 (1/2/3): " choice
    
    case $choice in
        1)
            echo "venv を削除中..."
            rm -rf backend/venv
            echo "✅ venv を削除しました"
            ;;
        2)
            echo ".venv を削除中..."
            rm -rf backend/.venv
            echo "✅ .venv を削除しました"
            ;;
        3)
            echo "両方の仮想環境を削除中..."
            rm -rf backend/.venv backend/venv
            echo "✅ 両方の仮想環境を削除しました"
            ;;
        *)
            echo "❌ 無効な選択です。スキップします。"
            ;;
    esac
fi

# 2. 開発用データベースファイルの削除
echo ""
echo "開発用データベースファイルを削除しますか？ (y/n)"
read -p "選択: " choice
if [ "$choice" = "y" ] || [ "$choice" = "Y" ]; then
    if [ -f "backend/test.db" ]; then
        rm -f backend/test.db
        echo "✅ test.db を削除しました"
    fi
    if [ -f "backend/test_backup.db" ]; then
        rm -f backend/test_backup.db
        echo "✅ test_backup.db を削除しました"
    fi
fi

# 3. Pythonキャッシュの削除
echo ""
echo "Pythonキャッシュファイルを削除しますか？ (y/n)"
read -p "選択: " choice
if [ "$choice" = "y" ] || [ "$choice" = "Y" ]; then
    find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    find . -name "*.pyo" -delete 2>/dev/null || true
    echo "✅ Pythonキャッシュファイルを削除しました"
fi

echo ""
echo "✅ クリーンアップが完了しました！"

