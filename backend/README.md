# Database LLM - Backend API

FastAPI service for testing database connections.

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
# or
venv\Scripts\activate  # On Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

### POST /api/test-connection/mysql
Test MySQL database connection.

**Request Body:**
```json
{
  "host": "localhost",
  "port": 3306,
  "database": "mydb",
  "user": "root",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to MySQL database 'mydb'",
  "steps": [
    {
      "id": 1,
      "label": "Validating credentials format",
      "status": "completed",
      "timestamp": 1234567890.123
    }
  ],
  "error": null
}
```
