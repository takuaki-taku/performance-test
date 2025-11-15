# Dev Container セットアップガイド

このプロジェクトは Dev Container を使用して開発環境を統一できます。Dev Container を使うことで、バックエンド（Python）とフロントエンド（Node.js）の両方の開発環境が自動でセットアップされます。

## 前提条件

- Docker Desktop がインストールされて実行されていること
- VS Code がインストールされていること
- VS Code に「Dev Containers」拡張機能がインストールされていること

### Dev Containers 拡張機能のインストール

VS Code で以下の手順でインストールできます：
1. 拡張機能タブを開く（Cmd+Shift+X / Ctrl+Shift+X）
2. "Dev Containers" で検索
3. "Dev Containers" をインストール

## Dev Container を開く手順

### 初回セットアップ

1. **プロジェクトを開く**
   ```bash
   cd /path/to/Perf_test
   code .
   ```

2. **Dev Container を開く**
   - VS Code で `Cmd+Shift+P`（Mac）または `Ctrl+Shift+P`（Windows/Linux）を押す
   - コマンドパレットが開くので、「Dev Containers: Reopen in Container」と入力して選択
   - 初回は Docker イメージのビルドに時間がかかります（5-10分程度）

3. **自動インストール待ち**
   - ビルド完了後、コンテナ内で依存関係が自動インストールされます：
     - バックエンド: Python のライブラリ（`backend/requirements.txt`）
     - フロントエンド: Node.js のライブラリ（`frontend/package.json`）

### 2回目以降

プロジェクトを開いたら、通常通り：
```
Dev Containers: Reopen in Container
```
を選択するだけです。既にビルドされたイメージが使われるので、起動が速いです。

## コンテナ内の環境

### インストールされるソフトウェア

- **Python 3.11** - バックエンド開発用
- **Node.js 18** - フロントエンド開発用
- **pip** - Python パッケージマネージャー
- **npm** - Node.js パッケージマネージャー
- **GitHub CLI (gh)** - GitHubのIssueやProjectをコマンドラインから操作

### ポート

以下のポートが自動で転送されます：

- **3000** - フロントエンド（Next.js）
- **8000** - バックエンド（FastAPI）

### マウントされるディレクトリ

プロジェクトのルートディレクトリがコンテナにマウントされているので、ローカルのファイルを編集するとコンテナ内でも反映されます。

## 開発の開始

### バックエンドサーバーを起動

```bash
cd backend
uvicorn main:app --reload
```

- バックエンドは `http://localhost:8000` でアクセスできます
- API ドキュメントは `http://localhost:8000/docs` で確認できます

### フロントエンドサーバーを起動

```bash
cd frontend
npm run dev
```

- フロントエンドは `http://localhost:3000` でアクセスできます

## トラブルシューティング

### コンテナが起動しない

1. **Docker Desktop が起動しているか確認**
   - Docker Desktop のアイコンをクリックして、実行中であることを確認

2. **ビルドエラーが発生した場合**
   ```
   Dev Containers: Rebuild Container
   ```
   を実行して再ビルドしてください

### 依存関係のエラー

コンテナ内で以下のコマンドで手動インストールできます：

```bash
# バックエンド
pip install -r backend/requirements.txt

# フロントエンド
cd frontend && npm install && cd ..
```

### コンテナを完全にクリーンアップしたい場合

```bash
Dev Containers: Remove Dev Container
```
を実行した後、再度コンテナを開いてください。

### ログを確認したい場合

1. Docker Desktop を開く
2. Containers タブを選択
3. 実行中のコンテナをクリックしてログを確認

## よくある質問

### Q: コンテナ内で git commit できる？
A: はい。ローカルの git 設定が引き継がれます。

### Q: GitHub CLI (gh) は使える？
A: はい。GitHub CLIがインストールされています。初回使用時は `gh auth login` で認証してください。

### Q: VS Code の拡張機能は使える？
A: はい。devcontainer.json で自動インストールされる拡張機能に加えて、手動でインストールも可能です。

### Q: ホストマシンのファイルにアクセスできる？
A: プロジェクトディレクトリにマウントされていますが、ホストの他のディレクトリには直接アクセスできません。必要な場合は docker-compose.yml で volume を追加してください。

### Q: コンテナが重たい
A: 不要になったコンテナを削除してください：
```bash
docker container prune
```

## 補足情報

### devcontainer.json の設定内容

- **Python 3.11**: バックエンド開発環境
- **Node.js 18**: フロントエンド開発環境
- **自動インストール**: コンテナ作成時に依存関係を自動インストール
- **ポート転送**: 3000（frontend）と 8000（backend）

### ファイル構成

```
.devcontainer/
  ├── Dockerfile          # ベースイメージのカスタマイズ
  ├── devcontainer.json   # Dev Container の設定
  ├── docker-compose.yml  # マルチコンテナ用（現在未使用）
  └── README.md           # このファイル
```

## サポート

問題が発生した場合は、GitHub の Issues で報告してください。

