#!/bin/bash
# Issue作成スクリプト

set -e

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# GitHub CLIがインストールされているか確認
if ! command -v gh &> /dev/null; then
    echo -e "${RED}エラー: GitHub CLI (gh) がインストールされていません${NC}"
    echo "インストール方法: https://cli.github.com/"
    exit 1
fi

# 認証状態を確認
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}警告: GitHub CLIが認証されていません${NC}"
    echo "認証を実行します..."
    gh auth login
fi

# 引数の確認
if [ $# -lt 1 ]; then
    echo "使用方法: $0 <タイトル> [オプション]"
    echo ""
    echo "オプション:"
    echo "  --label <ラベル>    ラベルを指定（複数可: --label bug --label backend）"
    echo "  --assignee <ユーザー> 担当者を指定"
    echo "  --milestone <マイルストーン> マイルストーンを指定"
    echo "  --body <本文>        本文を指定"
    echo "  --body-file <ファイル> 本文をファイルから読み込み"
    echo "  --template <テンプレート> テンプレートを使用 (task/bug/feature)"
    echo ""
    echo "例:"
    echo "  $0 \"[TASK] データベースマイグレーション\" --label task --label backend"
    echo "  $0 \"[BUG] ログインエラー\" --template bug"
    exit 1
fi

TITLE="$1"
shift

# デフォルト値
LABELS=()
ASSIGNEE=""
MILESTONE=""
BODY=""
BODY_FILE=""
TEMPLATE=""

# オプションの解析
while [[ $# -gt 0 ]]; do
    case $1 in
        --label)
            LABELS+=("$2")
            shift 2
            ;;
        --assignee)
            ASSIGNEE="$2"
            shift 2
            ;;
        --milestone)
            MILESTONE="$2"
            shift 2
            ;;
        --body)
            BODY="$2"
            shift 2
            ;;
        --body-file)
            BODY_FILE="$2"
            shift 2
            ;;
        --template)
            TEMPLATE="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}エラー: 不明なオプション: $1${NC}"
            exit 1
            ;;
    esac
done

# テンプレートの処理
if [ -n "$TEMPLATE" ]; then
    TEMPLATE_FILE=".github/ISSUE_TEMPLATE/${TEMPLATE}.md"
    if [ -f "$TEMPLATE_FILE" ]; then
        BODY_FILE="$TEMPLATE_FILE"
        echo -e "${GREEN}テンプレートを使用: $TEMPLATE_FILE${NC}"
    else
        echo -e "${YELLOW}警告: テンプレートファイルが見つかりません: $TEMPLATE_FILE${NC}"
    fi
fi

# Issue作成コマンドの構築
CMD="gh issue create --title \"$TITLE\""

# ラベルの追加
if [ ${#LABELS[@]} -gt 0 ]; then
    for label in "${LABELS[@]}"; do
        CMD="$CMD --label \"$label\""
    done
fi

# 担当者の追加
if [ -n "$ASSIGNEE" ]; then
    CMD="$CMD --assignee \"$ASSIGNEE\""
fi

# マイルストーンの追加
if [ -n "$MILESTONE" ]; then
    CMD="$CMD --milestone \"$MILESTONE\""
fi

# 本文の追加
if [ -n "$BODY_FILE" ]; then
    CMD="$CMD --body-file \"$BODY_FILE\""
elif [ -n "$BODY" ]; then
    CMD="$CMD --body \"$BODY\""
fi

# Issueを作成
echo -e "${GREEN}Issueを作成中...${NC}"
echo "タイトル: $TITLE"
if [ ${#LABELS[@]} -gt 0 ]; then
    echo "ラベル: ${LABELS[*]}"
fi
if [ -n "$ASSIGNEE" ]; then
    echo "担当者: $ASSIGNEE"
fi
if [ -n "$MILESTONE" ]; then
    echo "マイルストーン: $MILESTONE"
fi
echo ""

# コマンドを実行
eval $CMD

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Issueが正常に作成されました！${NC}"
else
    echo -e "${RED}❌ Issueの作成に失敗しました${NC}"
    exit 1
fi

