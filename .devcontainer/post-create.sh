#!/bin/bash
# Dev Container作成後のセットアップスクリプト

echo "🚀 Dev Container セットアップ中..."

# GitHub CLIの認証状態を確認
if command -v gh &> /dev/null; then
    if ! gh auth status &> /dev/null; then
        echo ""
        echo "📝 GitHub CLIの認証が必要です"
        echo "以下のコマンドで認証できます:"
        echo "  gh auth login"
        echo ""
        echo "認証後、以下のコマンドが使用できます:"
        echo "  - gh issue create    # Issue作成"
        echo "  - gh project list     # Project一覧"
        echo "  - ./scripts/create-issue.sh  # Issue作成スクリプト"
        echo ""
    else
        echo "✅ GitHub CLIは認証済みです"
    fi
fi

echo "✅ セットアップ完了！"

