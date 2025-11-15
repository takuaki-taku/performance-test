# GitHub Projects セットアップガイド

このプロジェクトでGitHubのIssueとProjectsを使ってタスク管理を行う方法を説明します。

## 1. GitHub Projects の作成

### 手順

1. **GitHubリポジトリにアクセス**
   - https://github.com/takuaki-taku/performance-test にアクセス

2. **Projectsタブを開く**
   - リポジトリの上部メニューから「Projects」をクリック

3. **新しいProjectを作成**
   - 「New project」をクリック
   - 「Board」または「Table」を選択（カンバン形式がおすすめ）

4. **Projectの設定**
   - 名前: 「Perf Test - Task Management」など
   - 説明: プロジェクトの説明を記入
   - 「Create」をクリック

## 2. カスタムフィールドの設定（オプション）

Projectsでは以下のようなカスタムフィールドを追加できます：

- **Status**: タスクの状態（Todo, In Progress, Done）
- **Priority**: 優先度（High, Medium, Low）
- **Assignee**: 担当者
- **Milestone**: マイルストーン

### カスタムフィールドの追加方法

1. Project画面で「+」ボタンをクリック
2. 「New field」を選択
3. フィールドタイプを選択（Text, Number, Date, Single select, Iteration）
4. フィールド名を入力して保存

## 3. Issueテンプレートの使用

このリポジトリには以下のIssueテンプレートが用意されています：

- **タスク** (`.github/ISSUE_TEMPLATE/task.md`)
- **バグ報告** (`.github/ISSUE_TEMPLATE/bug.md`)
- **機能追加** (`.github/ISSUE_TEMPLATE/feature.md`)

### Issueの作成方法

1. リポジトリの「Issues」タブを開く
2. 「New issue」をクリック
3. 適切なテンプレートを選択
4. テンプレートに従って情報を入力
5. 「Submit new issue」をクリック

## 4. IssueをProjectに追加

### 方法1: Issueから追加

1. Issueページを開く
2. 右側の「Projects」セクションでProjectを選択
3. 必要に応じてステータスやカスタムフィールドを設定

### 方法2: Projectから追加

1. Projectページを開く
2. 「+ Add item」をクリック
3. 既存のIssueを検索して追加、または新しいIssueを作成

## 5. ワークフローの例

### 基本的なワークフロー

```
[Todo] → [In Progress] → [Review] → [Done]
```

### カンバンボードの列設定例

1. **Backlog**: まだ着手していないタスク
2. **Todo**: これから取り組むタスク
3. **In Progress**: 現在作業中のタスク
4. **Review**: レビュー待ちのタスク
5. **Done**: 完了したタスク

## 6. ラベルの活用

Issueにラベルを付けることで、タスクを分類できます。

### 推奨ラベル

- `bug`: バグ報告
- `enhancement`: 機能追加
- `task`: タスク
- `documentation`: ドキュメント関連
- `backend`: バックエンド関連
- `frontend`: フロントエンド関連
- `database`: データベース関連
- `priority:high`: 高優先度
- `priority:medium`: 中優先度
- `priority:low`: 低優先度

### ラベルの作成方法

1. 「Issues」タブを開く
2. 「Labels」をクリック
3. 「New label」をクリック
4. ラベル名、色、説明を設定
5. 「Create label」をクリック

## 7. マイルストーンの活用

マイルストーンを使って、複数のIssueをグループ化できます。

### マイルストーンの作成方法

1. 「Issues」タブを開く
2. 「Milestones」をクリック
3. 「New milestone」をクリック
4. マイルストーン名、説明、期日を設定
5. 「Create milestone」をクリック

### マイルストーンの例

- v1.0.0 - 初期リリース
- v1.1.0 - 機能追加
- Sprint 1 - スプリント1

## 8. 自動化の設定（オプション）

GitHub Actionsを使って、IssueやPRの状態に応じて自動でProjectのステータスを更新できます。

### 例: PRがマージされたら自動でIssueを閉じる

`.github/workflows/auto-close-issue.yml`を作成：

```yaml
name: Auto close issue

on:
  pull_request:
    types: [closed]

jobs:
  close-issue:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/github-script@v6
        if: github.event.pull_request.merged == true
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'This issue has been automatically closed.'
            })
```

## 9. ベストプラクティス

1. **Issueは小さく分割する**
   - 1つのIssueは1つのタスクに集中
   - 完了条件を明確にする

2. **定期的にレビューする**
   - 週次や月次でProjectを確認
   - 古いIssueを整理

3. **ラベルを統一する**
   - チームでラベルの使い方を統一
   - ラベルの説明を明確にする

4. **マイルストーンを活用する**
   - リリース計画に合わせてマイルストーンを設定
   - 進捗を可視化

5. **コメントを活用する**
   - 作業の進捗をコメントで共有
   - 質問や議論はIssueのコメントで行う

## 10. 参考リンク

- [GitHub Projects ドキュメント](https://docs.github.com/ja/issues/planning-and-tracking-with-projects)
- [GitHub Issues ドキュメント](https://docs.github.com/ja/issues)
- [Issue テンプレート](https://docs.github.com/ja/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)

