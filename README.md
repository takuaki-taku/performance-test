# Physical Test Results App

## Overview

This application is designed to manage and display physical test results for users. It consists of a backend built with FastAPI and a frontend built with React.

## Design

デザイン案は以下のリンクで確認できます：

- [デザイン案](https://www.icloud.com/freeform/08bQvo9EUQ-52dXZEYT0AoHvw#Untitled_17)

> **注意**: このリンクは iOS 16.2+、iPadOS 16.2+、macOS Ventura 13.1+、または visionOS 1.0+ が必要です。

## Features

*   **User Management:**
    *   Create, read, update, and delete users.
    *   Assign a grade to each user.
*   **Result Management:**
    *   Record physical test results for each user.
    *   View a list of results for each user.
*   **Average/Max Data:**
    *   Calculate and display average and maximum test results for each grade.
*   **Frontend:**
    *   User-friendly interface for managing users and results.
    *   Display of individual results and average/max data.

## Technologies Used

*   **Backend:**
    *   FastAPI
    *   SQLAlchemy
    *   PostgreSQL / SQLite (for development)
*   **Frontend:**
    *   React
    *   Axios
    *   React Bootstrap

## Project Structure

```
Perf_test/
├── backend/              # 本番アプリケーションコード
│   ├── main.py          # FastAPIアプリケーション
│   ├── models.py        # データベースモデル
│   ├── schemas.py       # Pydanticスキーマ
│   ├── routers/         # APIルーター
│   └── ...
│
├── scripts/              # 開発・運用スクリプト
│   ├── dev/             # 開発用スクリプト
│   ├── migrations/      # データベースマイグレーション
│   └── github/          # GitHub CLI用スクリプト
│
├── frontend/            # フロントエンド
│
└── docs/                # ドキュメント
```

詳細は [scripts/README.md](scripts/README.md) を参照してください。

## Quick Start with Dev Container (Recommended)

開発環境を簡単にセットアップするには、Dev Container を使用することをお勧めします：

1. **Docker Desktop と VS Code の Dev Containers 拡張機能をインストール**
2. **プロジェクトを開く**
   ```bash
   git clone https://github.com/takuaki-taku/performance-test.git
   cd performance-test
   code .
   ```
3. **Dev Container を開く**
   - `Cmd+Shift+P` (Mac) または `Ctrl+Shift+P` (Windows/Linux)
   - 「Dev Containers: Reopen in Container」を選択
   - 初回はビルドに時間がかかります（5-10分）

詳細は [`.devcontainer/README.md`](.devcontainer/README.md) を参照してください。

## Setup Instructions

### Manual Setup

以下は Dev Container を使わない場合の手順です。

### Backend

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/takuaki-taku/performance-test.git
    cd backend
    ```

2.  **Create a virtual environment (optional but recommended):**

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Linux/macOS
    venv\Scripts\activate  # On Windows
    ```

3.  **Install dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**

    ```bash
    cp .env.example .env
    # .envファイルを編集してDATABASE_URLを設定
    ```

5.  **Run the application:**

    ```bash
    uvicorn backend.main:app --reload
    ```

    The backend will be accessible at `http://localhost:8000`.

### Frontend

1.  **Navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the application:**

    ```bash
    npm start
    ```

    The frontend will be accessible at `http://localhost:3000`.

## API Endpoints

*   **Users:**
    *   `GET /users/`: Get all users.
    *   `GET /users/{user_id}`: Get a specific user by ID.
    *   `POST /users/`: Create a new user.
    *   `PUT /users/{user_id}`: Update an existing user.
    *   `DELETE /users/{user_id}`: Delete a user.
*   **Results:**
    *   `POST /user_results/`: Create a new result for a user.
    *   `DELETE /user_results/{result_id}`: Delete a result.
*   **Average/Max Data:**
    *   `GET /average_data/grade/{grade}`: Get average data for a specific grade.
    *   `GET /max_data/grade/{grade}`: Get max data for a specific grade.
    *   `POST /average_data/`: Create average data.
    *   `POST /max_data/`: Create max data.

## Database Setup

The backend uses PostgreSQL for production and SQLite for development. The database file is `test.db` for SQLite. You can use a tool like DB Browser for SQLite to inspect the database.

### Database Migrations

マイグレーションスクリプトは `scripts/migrations/` にあります。

```bash
# データベース初期化
python scripts/dev/init_db.py

# SQLiteからPostgreSQLへ移行
python scripts/migrations/migrate_sqlite_to_postgres.py
```

## Contributing

Contributions are welcome! Please submit a pull request with your changes.

## License

[MIT](LICENSE)
