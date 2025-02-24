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
    *   `GET /average_max_data/grade/{grade}`: Get average/max data for a specific grade.

## Database Setup

The backend uses SQLite for development. The database file is `test.db`. You can use a tool like DB Browser for SQLite to inspect the database.

## Contributing

Contributions are welcome! Please submit a pull request with your changes.

## License

[MIT](LICENSE)