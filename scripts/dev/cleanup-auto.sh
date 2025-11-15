#!/bin/bash
# 開発環境の自動クリーンアップスクリプト（非対話式）

set -e

echo "🧹 開発環境の自動クリーンアップを開始します..."
echo ""

# プロジェクトルートに移動
cd "$(dirname "$0")/../.."

# 1. 仮想環境の整理（.venvを優先、venvを削除）
if [ -d "backend/.venv" ] && [ -d "backend/venv" ]; then
    echo "⚠️  仮想環境が2つ見つかりました"
    echo "  - backend/.venv を保持"
    echo "  - backend/venv を削除中..."
    rm -rf backend/venv
    echo "✅ venv を削除しました（.venv を保持）"
elif [ -d "backend/venv" ] && [ ! -d "backend/.venv" ]; then
    echo "ℹ️  venv が見つかりました（.venv は存在しません）"
    echo "   そのまま保持します"
fi

# 2. 開発用データベースファイルの削除
echo ""
echo "開発用データベースファイルを削除中..."
if [ -f "backend/test.db" ]; then
    rm -f backend/test.db
    echo "✅ test.db を削除しました"
fi
if [ -f "backend/test_backup.db" ]; then
    rm -f backend/test_backup.db
    echo "✅ test_backup.db を削除しました"
fi

# 3. Pythonキャッシュの削除（backend/とrouters/のみ）
echo ""
echo "Pythonキャッシュファイルを削除中..."
find backend -type d -name "__pycache__" ! -path "backend/.venv/*" ! -path "backend/venv/*" -exec rm -r {} + 2>/dev/null || true
find backend -name "*.pyc" ! -path "backend/.venv/*" ! -path "backend/venv/*" -delete 2>/dev/null || true
find backend -name "*.pyo" ! -path "backend/.venv/*" ! -path "backend/venv/*" -delete 2>/dev/null || true
echo "✅ Pythonキャッシュファイルを削除しました（仮想環境内は除く）"

echo ""
echo "✅ クリーンアップが完了しました！"

