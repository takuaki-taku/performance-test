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
│   ├── migrate_data.py
│   ├── convert_pdf_to_png.py  # PDFをPNGに変換
│   └── insert_warmup_cooldown_trainings.py  # ウォームアップ/クールダウンをDBに投入
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

# User.idをInteger型からUUID型に変更（既存データ移行）
python scripts/migrations/migrate_user_id_to_uuid.py

# PDFをPNGに変換（ウォームアップ/クールダウン用）
python scripts/migrations/convert_pdf_to_png.py

# trainingsテーブルにシリーズ情報カラムを追加（初回のみ）
python scripts/migrations/add_series_fields_to_trainings.py

# PDFをPNGに変換（ウォームアップ/クールダウン用）
python scripts/migrations/convert_pdf_to_png.py

# ウォームアップ/クールダウンのトレーニングデータをDBに投入
python scripts/migrations/insert_warmup_cooldown_trainings.py
```

### GitHub CLIスクリプト

```bash
# Issue作成
./scripts/github/create-issue.sh "[TASK] タスク" --label task

# IssueをProjectに追加
./scripts/github/add-to-project.sh 3 10
```

## ウォームアップ/クールダウンの追加手順

1. **必要なライブラリのインストール**
   ```bash
   pip install pdf2image Pillow
   ```

2. **システム依存のインストール（Poppler）**
   - macOS: `brew install poppler`
   - Ubuntu: `sudo apt-get install poppler-utils`
   - Windows: https://github.com/oschwartz10612/poppler-windows/releases

3. **PDFファイルの配置**
   - プロジェクトルートにPDFファイルを配置
   - 例: `Stretching for cool down.pdf`, `202010Lynx warm up写真付きver1.pdf`

4. **データベースマイグレーション（初回のみ）**
   ```bash
   python scripts/migrations/add_series_fields_to_trainings.py
   ```
   - trainingsテーブルに`series_name`, `series_number`, `page_number`カラムを追加します

5. **PDFをPNGに変換**
   ```bash
   python scripts/migrations/convert_pdf_to_png.py
   ```
   - `frontend/public/images/warmup/` と `frontend/public/images/cooldown/` にPNGが生成されます

6. **DBにデータを投入**
   ```bash
   python scripts/migrations/insert_warmup_cooldown_trainings.py
   ```

## 注意事項

- マイグレーションスクリプトは実行前にデータベースのバックアップを取ることを推奨します
- 本番環境で実行する前に、開発環境でテストしてください
- PDF変換にはPopplerが必要です。インストールされていない場合はエラーになります

