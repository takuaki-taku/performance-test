# プロジェクト構造の整理提案

## 現状の問題点

### 1. 開発用スクリプトと本番コードが混在
- `backend/` にマイグレーションスクリプトが多数存在
- 開発用データベースファイル（`test.db`, `test_backup.db`）がbackend/に
- 仮想環境（`venv/`）がbackend/に

### 2. マイグレーションスクリプトの分類が不明確
- 一時的なマイグレーション（`migrate_to_float.py`, `migrate_to_integer_enums.py`）
- データ移行用（`migrate_sqlite_to_postgres.py`, `migrate_data.py`）
- 初期化用（`init_db.py`）

## 提案する構造

```
Perf_test/
├── backend/                    # 本番アプリケーションコード
│   ├── __init__.py
│   ├── main.py
│   ├── db.py
│   ├── models.py
│   ├── schemas.py
│   ├── enums.py
│   ├── deps.py
│   ├── routers/
│   ├── Dockerfile
│   └── requirements.txt
│
├── scripts/                    # 開発・運用スクリプト
│   ├── dev/                    # 開発用スクリプト
│   │   ├── init_db.py          # データベース初期化
│   │   ├── migrate_data.py     # データ移行
│   │   └── ...
│   │
│   ├── migrations/             # データベースマイグレーション
│   │   ├── migrate_sqlite_to_postgres.py
│   │   ├── migrate_to_float.py
│   │   ├── migrate_to_integer_enums.py
│   │   └── migrate_enums.py
│   │
│   └── github/                 # GitHub CLI用スクリプト
│       ├── create-issue.sh
│       └── add-to-project.sh
│
├── docs/                       # ドキュメント
│
├── .devcontainer/              # Dev Container設定
│
└── frontend/                   # フロントエンド
```

## 整理のメリット

### 1. 明確な分離
- **本番コード**: `backend/` にアプリケーションコードのみ
- **開発ツール**: `scripts/` に開発・運用スクリプト
- **ドキュメント**: `docs/` に整理

### 2. 保守性の向上
- マイグレーションスクリプトが一箇所に集約
- 一時的なスクリプトと恒久的なスクリプトを分離可能
- 新しい開発者が構造を理解しやすい

### 3. デプロイ時の明確化
- `backend/` のみをデプロイ対象にできる
- 開発用スクリプトを誤ってデプロイするリスクを低減

## 実装手順

1. `scripts/` ディレクトリ構造を作成
2. マイグレーションスクリプトを移動
3. 開発用スクリプトを移動
4. インポートパスを修正
5. `.gitignore` を更新
6. READMEを更新

