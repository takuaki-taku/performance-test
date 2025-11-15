# GitHub CLI クイックスタート

## 今すぐ使う方法

### 1. 認証（初回のみ）

```bash
gh auth login
```

認証方法を選択：
- **GitHub.com** を選択
- **HTTPS** または **SSH** を選択（通常はHTTPS）
- **認証方法** を選択：
  - **Login with a web browser**（推奨）- ブラウザで認証
  - **Paste an authentication token** - トークンを貼り付け

### 2. 基本的な使い方

#### Issueの作成

```bash
# 基本的な作成
gh issue create --title "[TASK] タスクのタイトル" --body "タスクの説明"

# ラベルを付けて作成
gh issue create --title "[BUG] バグ修正" --body "説明" --label "bug"

# テンプレートを使用
gh issue create --title "[TASK] タスク" --body-file .github/ISSUE_TEMPLATE/task.md
```

#### Issue一覧

```bash
# すべてのIssue
gh issue list

# オープンなIssueのみ
gh issue list --state open

# 担当しているIssue
gh issue list --assignee @me
```

#### Project操作

```bash
# Project一覧
gh project list

# Projectの詳細表示
gh project view <project_number>

# IssueをProjectに追加
gh project item-add <project_number> --owner takuaki-taku --url <issue_url>
```

### 3. 便利なスクリプト

```bash
# Issue作成スクリプト
./scripts/create-issue.sh "[TASK] データベースマイグレーション" \
  --label task --label backend \
  --template task

# IssueをProjectに追加
./scripts/add-to-project.sh 1 10  # Project #1にIssue #10を追加
```

## よく使うコマンド

```bash
# Issueの詳細表示
gh issue view <number>

# Issueをブラウザで開く
gh issue view <number> --web

# Issueをクローズ
gh issue close <number> --comment "完了しました"

# Issueにコメント
gh issue comment <number> --body "コメント内容"
```

## 認証状態の確認

```bash
# 認証状態を確認
gh auth status

# 認証情報を表示
gh auth status --show-token
```

## トラブルシューティング

### 認証エラーが出る場合

```bash
# 再認証
gh auth login

# 認証情報をリセット
gh auth logout
gh auth login
```

### リポジトリが見つからない場合

```bash
# 現在のリポジトリを確認
gh repo view

# リポジトリを設定
gh repo set-default takuaki-taku/performance-test
```

