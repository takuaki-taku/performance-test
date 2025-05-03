# Physical Test Results App

## Overview

This application is designed to manage and display physical test results for users. It consists of a backend built with FastAPI and a frontend built with React.

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
    *   SQLite (for development)
*   **Frontend:**
    *   React
    *   Axios
    *   React Bootstrap

## Setup Instructions

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

4.  **Run the application:**

    ```bash
    uvicorn main:app --reload
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

## APIエンドポイント一覧

### ユーザー関連

- `POST   /users/`  
  ユーザーを新規作成

- `GET    /users/{user_id}`  
  指定したユーザー情報を取得

- `GET    /users/`  
  ユーザー一覧を取得

---

### 結果（リザルト）関連

- `POST   /user_results/`  
  結果（リザルト）を新規作成

- `GET    /user_results/{user_id}`  
  指定ユーザーの結果一覧を取得

- `DELETE /user_results/{result_id}`  
  結果（リザルト）を削除

---

### 平均・最大データ関連

- `POST   /average_max_data/`  
  平均・最大データを新規作成

- `GET    /average_max_data/grade/{grade}`  
  指定学年の平均・最大データ一覧を取得

- `POST   /average_data/`  
  平均データを新規作成

- `GET    /average_data/grade/{grade}`  
  指定学年の平均データを取得

- `POST   /max_data/`  
  最大データを新規作成

- `GET    /max_data/grade/{grade}`  
  指定学年の最大データを取得

---

### 柔軟性チェック関連

- `GET    /flexibility-checks/`  
  柔軟性チェック一覧を取得

- `POST   /flexibility-checks/`  
  柔軟性チェックを新規作成

- `PUT    /flexibility-checks/{check_id}`  
  柔軟性チェックを更新

- `DELETE /flexibility-checks/{check_id}`  
  柔軟性チェックを削除

## Database Setup

The backend uses SQLite for development. The database file is `test.db`. You can use a tool like DB Browser for SQLite to inspect the database.

## Contributing

Contributions are welcome! Please submit a pull request with your changes.

## License

[MIT](LICENSE)