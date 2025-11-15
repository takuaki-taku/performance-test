#!/bin/bash
# IssueをProjectに追加するスクリプト

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# GitHub CLIがインストールされているか確認
if ! command -v gh &> /dev/null; then
    echo -e "${RED}エラー: GitHub CLI (gh) がインストールされていません${NC}"
    exit 1
fi

# 引数の確認
if [ $# -lt 2 ]; then
    echo "使用方法: $0 <project_number> <issue_number>"
    echo ""
    echo "例:"
    echo "  $0 1 10  # Project #1にIssue #10を追加"
    echo ""
    echo "Project番号の確認方法:"
    echo "  gh project list"
    exit 1
fi

PROJECT_NUMBER="$1"
ISSUE_NUMBER="$2"

# リポジトリ情報を取得
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
OWNER=$(echo $REPO | cut -d'/' -f1)

# IssueのURLを構築
ISSUE_URL="https://github.com/${REPO}/issues/${ISSUE_NUMBER}"

echo -e "${GREEN}Issue #${ISSUE_NUMBER}をProject #${PROJECT_NUMBER}に追加中...${NC}"

# ProjectにIssueを追加
gh project item-add "$PROJECT_NUMBER" \
    --owner "$OWNER" \
    --url "$ISSUE_URL"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Issue #${ISSUE_NUMBER}がProject #${PROJECT_NUMBER}に追加されました！${NC}"
else
    echo -e "${RED}❌ 追加に失敗しました${NC}"
    exit 1
fi

