# backend/Dockerfile
FROM python:3.9

WORKDIR /app

# Install Python deps (requirements.txt is in this directory)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend code into package path /app/backend
COPY . /app/backend

# Run as package entrypoint
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

EXPOSE 8000