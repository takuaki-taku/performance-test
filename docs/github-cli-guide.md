# GitHub CLI ガイド

GitHub CLI（`gh`）を使ってIssueやProjectをコマンドラインから操作する方法を説明します。

## インストール

### Linux/macOS

```bash
# Homebrew (macOS)
brew install gh

# または公式インストールスクリプト
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### Windows

```powershell
# Chocolatey
choco install gh

# またはScoop
scoop install gh
```

## 認証

```bash
# 初回認証
gh auth login

# 認証状態の確認
gh auth status
```

## Issue操作

### Issueの作成

```bash
# 基本的なIssue作成
gh issue create --title "タスクのタイトル" --body "タスクの説明"

# テンプレートを使用
gh issue create --title "[TASK] データベースマイグレーション" --body-file .github/ISSUE_TEMPLATE/task.md

# ラベルを付けて作成
gh issue create --title "バグ修正" --body "バグの説明" --label "bug"

# 担当者を指定
gh issue create --title "タスク" --body "説明" --assignee @me

# マイルストーンを指定
gh issue create --title "機能追加" --body "説明" --milestone "v1.0.0"
```

### Issueの一覧表示

```bash
# すべてのIssueを表示
gh issue list

# オープンなIssueのみ
gh issue list --state open

# クローズ済みのIssue
gh issue list --state closed

# ラベルでフィルタ
gh issue list --label "bug"

# 担当者でフィルタ
gh issue list --assignee @me
```

### Issueの表示・編集

```bash
# Issueの詳細を表示
gh issue view <issue_number>

# Issueをブラウザで開く
gh issue view <issue_number> --web

# Issueをクローズ
gh issue close <issue_number>

# Issueを再オープン
gh issue reopen <issue_number>

# Issueにコメントを追加
gh issue comment <issue_number> --body "コメント内容"
```

## Project操作

### Projectの作成

```bash
# 新しいProjectを作成（カンバンボード）
gh project create --title "Perf Test - Task Management" --format board

# テーブル形式で作成
gh project create --title "Perf Test - Task Management" --format table

# 説明を付けて作成
gh project create --title "Perf Test - Task Management" --body "タスク管理用のProject"
```

### Projectの一覧表示

```bash
# リポジトリのProject一覧
gh project list

# オーナーのProject一覧
gh project list --owner <owner_name>
```

### ProjectへのIssue追加

```bash
# ProjectにIssueを追加
gh project item-add <project_number> --owner <owner> --url <issue_url>

# 例: Issue #1をProjectに追加
gh project item-add 1 --owner takuaki-taku --url https://github.com/takuaki-taku/performance-test/issues/1
```

### Projectの表示

```bash
# Projectの詳細を表示
gh project view <project_number>

# Projectをブラウザで開く
gh project view <project_number> --web
```

## 便利なスクリプト例

### タスクを一括作成

```bash
#!/bin/bash
# create-tasks.sh

tasks=(
  "データベーススキーマの更新"
  "APIエンドポイントの追加"
  "フロントエンドコンポーネントの実装"
  "テストの追加"
)

for task in "${tasks[@]}"; do
  gh issue create \
    --title "[TASK] $task" \
    --body "タスク: $task" \
    --label "task"
done
```

### IssueをProjectに一括追加

```bash
#!/bin/bash
# add-issues-to-project.sh

PROJECT_NUMBER=1
OWNER="takuaki-taku"
REPO="performance-test"

# オープンなIssueを取得してProjectに追加
gh issue list --state open --json number,url | \
  jq -r '.[] | "\(.number)|\(.url)"' | \
  while IFS='|' read -r number url; do
    echo "Adding issue #$number to project..."
    gh project item-add $PROJECT_NUMBER --owner $OWNER --url "$url"
  done
```

## エイリアスの設定

`.bashrc`や`.zshrc`に以下を追加すると便利です：

```bash
# GitHub CLI エイリアス
alias ghi='gh issue'
alias ghp='gh project'
alias ghil='gh issue list'
alias ghic='gh issue create'
alias ghiw='gh issue view'
```

## 実践例

### 1. 新しいタスクを作成してProjectに追加

```bash
# Issueを作成
ISSUE_NUMBER=$(gh issue create \
  --title "[TASK] データベースマイグレーション" \
  --body "PostgreSQLへの移行を完了する" \
  --label "task,backend" \
  --json number -q .number)

# Projectに追加（Project番号は実際の値に置き換え）
gh project item-add 1 \
  --owner takuaki-taku \
  --url "https://github.com/takuaki-taku/performance-test/issues/$ISSUE_NUMBER"
```

### 2. 今日のタスクを確認

```bash
# 担当しているオープンなIssueを表示
gh issue list --assignee @me --state open
```

### 3. 完了したタスクをクローズ

```bash
# Issue #10をクローズ
gh issue close 10 --comment "完了しました"
```

## 参考リンク

- [GitHub CLI 公式ドキュメント](https://cli.github.com/manual/)
- [gh issue コマンド](https://cli.github.com/manual/gh_issue)
- [gh project コマンド](https://cli.github.com/manual/gh_project)

