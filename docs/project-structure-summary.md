# プロジェクト構造整理の完了報告

## 実施した整理内容

### 1. ディレクトリ構造の整理

**Before:**
```
backend/
├── main.py (本番コード)
├── models.py (本番コード)
├── migrate_*.py (開発用スクリプト - 5ファイル)
├── init_db.py (開発用スクリプト)
└── migrate_data.py (開発用スクリプト)
```

**After:**
```
backend/                    # 本番アプリケーションコードのみ
├── main.py
├── models.py
├── schemas.py
├── db.py
├── deps.py
├── enums.py
└── routers/

scripts/                    # 開発・運用スクリプト
├── dev/                    # 開発用スクリプト
│   ├── init_db.py
│   └── migrate_data.py
├── migrations/             # データベースマイグレーション
│   ├── migrate_sqlite_to_postgres.py
│   ├── migrate_to_float.py
│   ├── migrate_to_integer_enums.py
│   ├── migrate_enums.py
│   └── migrate_data.py
└── github/                 # GitHub CLI用スクリプト
    ├── create-issue.sh
    └── add-to-project.sh
```

### 2. インポートパスの修正

すべてのスクリプトで、プロジェクトルートをパスに追加するように修正：

```python
import sys
from pathlib import Path

# プロジェクトルートをパスに追加
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.models import ...
```

### 3. 環境変数パスの修正

`.env`ファイルのパス参照を修正：

```python
# Before: Path(__file__).parent.parent / ".env"
# After:  Path(__file__).parent.parent.parent / ".env"
```

### 4. ドキュメントの追加

- `scripts/README.md` - スクリプトの使用方法
- `README.md` - プロジェクト構造の説明を追加
- `.gitignore` - scriptsディレクトリのキャッシュファイルを追加

## 整理のメリット

### ✅ 明確な分離
- **本番コード**: `backend/` にアプリケーションコードのみ
- **開発ツール**: `scripts/` に開発・運用スクリプト
- **ドキュメント**: `docs/` に整理

### ✅ 保守性の向上
- マイグレーションスクリプトが一箇所に集約
- 一時的なスクリプトと恒久的なスクリプトを分離可能
- 新しい開発者が構造を理解しやすい

### ✅ デプロイ時の明確化
- `backend/` のみをデプロイ対象にできる
- 開発用スクリプトを誤ってデプロイするリスクを低減

## 使用方法

### 開発用スクリプト

```bash
# データベース初期化
python scripts/dev/init_db.py

# データ移行
python scripts/dev/migrate_data.py
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
- スクリプトはプロジェクトルートから実行してください

