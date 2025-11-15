# Scripts ディレクトリ

開発・運用スクリプトを管理するディレクトリです。

## ディレクトリ構成

```
scripts/
├── dev/              # 開発用スクリプト
│   ├── init_db.py    # データベース初期化
│   └── migrate_data.py  # データ移行
│
├── migrations/       # データベースマイグレーション
│   ├── migrate_sqlite_to_postgres.py
│   ├── migrate_to_float.py
│   ├── migrate_to_integer_enums.py
│   ├── migrate_enums.py
│   └── migrate_data.py
│
└── github/           # GitHub CLI用スクリプト
    ├── create-issue.sh
    └── add-to-project.sh
```

## 使用方法

### 開発用スクリプト

```bash
# データベース初期化
python scripts/dev/init_db.py

# データ移行
python scripts/dev/migrate_data.py

# 開発環境のクリーンアップ（対話式）
./scripts/dev/cleanup.sh

# 開発環境のクリーンアップ（自動）
./scripts/dev/cleanup-auto.sh
```

### マイグレーションスクリプト

```bash
# SQLiteからPostgreSQLへ移行
python scripts/migrations/migrate_sqlite_to_postgres.py

# テスト結果カラムをFloat型に変更
python scripts/migrations/migrate_to_float.py

# Enum型をInteger型に変更
python scripts/migrations/migrate_to_integer_enums.py
```

### GitHub CLIスクリプト

```bash
# Issue作成
./scripts/github/create-issue.sh "[TASK] タスク" --label task

# IssueをProjectに追加
./scripts/github/add-to-project.sh 3 10
```

## 注意事項

- マイグレーションスクリプトは実行前にデータベースのバックアップを取ることを推奨します
- 本番環境で実行する前に、開発環境でテストしてください

