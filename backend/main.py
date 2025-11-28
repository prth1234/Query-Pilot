from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import time

app = FastAPI(title="Database LLM Connection Service")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MySQLConnectionRequest(BaseModel):
    host: str
    port: int
    database: str
    user: str
    password: str

class ConnectionResponse(BaseModel):
    success: bool
    message: str
    steps: list[dict]
    error: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Database LLM Connection Service", "status": "running"}

@app.post("/api/test-connection/mysql", response_model=ConnectionResponse)
async def test_mysql_connection(request: MySQLConnectionRequest):
    """
    Test MySQL database connection with provided credentials.
    Returns success status and detailed steps of the connection process.
    """
    steps = []
    
    try:
        # Step 1: Validate credentials format
        steps.append({
            "id": 1,
            "label": "Validating credentials format",
            "status": "in_progress",
            "timestamp": time.time()
        })
        
        # Basic validation
        if not request.host or not request.user or not request.database:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = "Missing required credentials"
            return ConnectionResponse(
                success=False,
                message="Invalid credentials format",
                steps=steps,
                error="Missing required credentials"
            )
        
        time.sleep(0.3)  # Simulate processing
        steps[-1]["status"] = "completed"
        
        # Step 2: Establishing connection
        steps.append({
            "id": 2,
            "label": "Establishing connection",
            "status": "in_progress",
            "timestamp": time.time()
        })
        
        try:
            import pymysql
            
            # Attempt to connect to MySQL (without selecting database first)
            connection = pymysql.connect(
                host=request.host,
                port=request.port,
                user=request.user,
                password=request.password,
                connect_timeout=10,
                read_timeout=10,
                write_timeout=10
            )
            
            steps[-1]["status"] = "completed"
            
        except ImportError:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = "PyMySQL not installed"
            return ConnectionResponse(
                success=False,
                message="PyMySQL driver not found. Please install: pip install pymysql",
                steps=steps,
                error="PyMySQL not installed"
            )
        except pymysql.err.OperationalError as e:
            steps[-1]["status"] = "failed"
            error_msg = str(e)
            steps[-1]["error"] = error_msg
            
            # Provide user-friendly error messages
            if "Can't connect" in error_msg or "Unknown MySQL server host" in error_msg:
                message = f"Cannot reach host '{request.host}:{request.port}'. Check host/port and network."
            elif "Access denied" in error_msg:
                message = f"Access denied for user '{request.user}'. Check username/password."
            else:
                message = f"Connection failed: {error_msg}"
            
            return ConnectionResponse(
                success=False,
                message=message,
                steps=steps,
                error=error_msg
            )
        except Exception as e:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = str(e)
            return ConnectionResponse(
                success=False,
                message=f"Connection error: {str(e)}",
                steps=steps,
                error=str(e)
            )
        
        # Step 3: Authenticating user
        steps.append({
            "id": 3,
            "label": "Authenticating user",
            "status": "completed",
            "timestamp": time.time()
        })
        
        # Step 4: Checking database access
        steps.append({
            "id": 4,
            "label": "Checking database access",
            "status": "in_progress",
            "timestamp": time.time()
        })
        
        try:
            cursor = connection.cursor()
            
            # Explicitly try to select the database
            try:
                cursor.execute(f"USE `{request.database}`")
            except Exception as db_err:
                steps[-1]["status"] = "failed"
                steps[-1]["error"] = f"Database '{request.database}' not found or not accessible"
                connection.close()
                return ConnectionResponse(
                    success=False,
                    message=f"Cannot access database '{request.database}'",
                    steps=steps,
                    error=str(db_err)
                )
            
            steps[-1]["status"] = "completed"
            
        except Exception as e:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = str(e)
            connection.close()
            return ConnectionResponse(
                success=False,
                message=f"Database access error: {str(e)}",
                steps=steps,
                error=str(e)
            )
        
        # Step 5: Testing SELECT privileges
        steps.append({
            "id": 5,
            "label": "Testing SELECT privileges",
            "status": "in_progress",
            "timestamp": time.time()
        })
        
        try:
            # Test basic SELECT query
            cursor.execute("SELECT 1 AS test")
            result = cursor.fetchone()
            
            if result[0] != 1:
                steps[-1]["status"] = "failed"
                steps[-1]["error"] = "SELECT query failed"
                connection.close()
                return ConnectionResponse(
                    success=False,
                    message="Cannot execute SELECT queries",
                    steps=steps,
                    error="SELECT privilege test failed"
                )
            
            # Test table listing (optional but useful)
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            steps[-1]["status"] = "completed"
            steps[-1]["tables_found"] = len(tables)
            
        except Exception as e:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = str(e)
            connection.close()
            return ConnectionResponse(
                success=False,
                message=f"SELECT privilege test failed: {str(e)}",
                steps=steps,
                error=str(e)
            )
        
        # Step 6: Connection successful
        steps.append({
            "id": 6,
            "label": "Connection successful",
            "status": "completed",
            "timestamp": time.time()
        })
        
        # Clean up
        cursor.close()
        connection.close()
        
        return ConnectionResponse(
            success=True,
            message=f"Successfully connected to MySQL database '{request.database}'",
            steps=steps
        )
        
    except Exception as e:
        # Catch any unexpected errors
        return ConnectionResponse(
            success=False,
            message=f"Unexpected error: {str(e)}",
            steps=steps,
            error=str(e)
        )

@app.get("/health")
def health_check():
    return {"status": "healthy"}
