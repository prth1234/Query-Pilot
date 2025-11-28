from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time

app = FastAPI(title="Database LLM Connection Service")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:3000"
    ],
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

class QueryRequest(BaseModel):
    query: str
    host: str
    port: int
    database: str
    user: str
    password: str
    db_type: str  # 'mysql' or 'postgresql'

class QueryResponse(BaseModel):
    success: bool
    columns: Optional[List[str]] = None
    rows: Optional[List[Dict[str, Any]]] = None
    rowCount: Optional[int] = None
    executionTime: Optional[int] = None  # in milliseconds
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
            steps[-1]["error"] = "Authentication failed"
            
            # Provide user-friendly error messages
            if "Can't connect" in error_msg or "Unknown MySQL server host" in error_msg:
                message = f"Cannot reach host '{request.host}:{request.port}'. Check host/port and network."
            elif "Access denied" in error_msg:
                message = "Access denied. Please check your username and password."
            elif "cryptography" in error_msg.lower() or "caching_sha2_password" in error_msg.lower() or "sha256_password" in error_msg.lower():
                # This usually means wrong password with MySQL 8.0+ authentication
                message = "Authentication failed. Please verify your credentials (username/password)."
            else:
                message = f"Connection failed: {error_msg}"
            
            return ConnectionResponse(
                success=False,
                message=message,
                steps=steps,
                error="Authentication failed"
            )
        except Exception as e:
            steps[-1]["status"] = "failed"
            error_msg = str(e)
            
            # Check if it's a cryptography-related error
            if "cryptography" in error_msg.lower() or "sha256_password" in error_msg.lower() or "caching_sha2_password" in error_msg.lower():
                steps[-1]["error"] = "Authentication failed"
                return ConnectionResponse(
                    success=False,
                    message="Authentication failed. Please verify your credentials (username/password).",
                    steps=steps,
                    error="Authentication failed"
                )
            
            steps[-1]["error"] = error_msg
            return ConnectionResponse(
                success=False,
                message=f"Connection error: {error_msg}",
                steps=steps,
                error=error_msg
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

@app.post("/api/test-connection/postgresql", response_model=ConnectionResponse)
async def test_postgresql_connection(request: MySQLConnectionRequest):
    """
    Test PostgreSQL database connection with provided credentials.
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
            import psycopg2
            
            # Attempt to connect to PostgreSQL
            # Postgres requires a database to connect to, usually 'postgres' is the default maintenance db
            # But we can try connecting directly to the requested database
            connection = psycopg2.connect(
                host=request.host,
                port=request.port,
                user=request.user,
                password=request.password,
                dbname=request.database,
                connect_timeout=10
            )
            
            steps[-1]["status"] = "completed"
            
        except ImportError:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = "psycopg2 not installed"
            return ConnectionResponse(
                success=False,
                message="psycopg2 driver not found. Please install: pip install psycopg2-binary",
                steps=steps,
                error="psycopg2 not installed"
            )
        except psycopg2.OperationalError as e:
            steps[-1]["status"] = "failed"
            error_msg = str(e)
            steps[-1]["error"] = error_msg.split('\n')[0] # Keep it brief
            
            return ConnectionResponse(
                success=False,
                message=f"Connection failed: {error_msg.split(chr(10))[0]}", # First line only
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
        
        # In Postgres, if we connected successfully above with dbname=request.database, 
        # we already have access. But let's verify.
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT current_database()")
            current_db = cursor.fetchone()[0]
            
            if current_db != request.database:
                steps[-1]["status"] = "failed"
                steps[-1]["error"] = f"Connected to '{current_db}' instead of '{request.database}'"
                connection.close()
                return ConnectionResponse(
                    success=False,
                    message=f"Cannot access database '{request.database}'",
                    steps=steps,
                    error=f"Database '{request.database}' not found or not accessible"
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
            cursor.execute("SELECT 1")
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
            
            # Test table listing
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
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
            message=f"Successfully connected to PostgreSQL database '{request.database}'",
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

@app.post("/api/execute-query", response_model=QueryResponse)
async def execute_query(request: QueryRequest):
    """
    Execute a SQL query on the connected database.
    Returns query results with columns, rows, and execution time.
    """
    start_time = time.time()
    
    try:
        # Validate query
        if not request.query or not request.query.strip():
            return QueryResponse(
                success=False,
                error="Query cannot be empty"
            )
        
        # Check for dangerous operations
        query_upper = request.query.strip().upper()
        dangerous_keywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER', 'CREATE', 'INSERT', 'UPDATE']
        if any(keyword in query_upper.split()[0] for keyword in dangerous_keywords):
            return QueryResponse(
                success=False,
                error=f"Only SELECT queries are allowed for safety"
            )
        
        if request.db_type == 'mysql':
            try:
                import pymysql
                
                connection = pymysql.connect(
                    host=request.host,
                    port=request.port,
                    user=request.user,
                    password=request.password,
                    database=request.database,
                    connect_timeout=10,
                    read_timeout=30,
                    write_timeout=30,
                    cursorclass=pymysql.cursors.DictCursor
                )
                
                cursor = connection.cursor()
                cursor.execute(request.query)
                rows = cursor.fetchall()
                
                # Get column names
                columns = [desc[0] for desc in cursor.description] if cursor.description else []
                
                # Convert rows to list of dicts with string keys
                formatted_rows = []
                for row in rows:
                    formatted_row = {}
                    for key, value in row.items():
                        # Convert any non-serializable types to strings
                        if value is None:
                            formatted_row[key] = None
                        elif isinstance(value, (int, float, str, bool)):
                            formatted_row[key] = value
                        else:
                            formatted_row[key] = str(value)
                    formatted_rows.append(formatted_row)
                
                cursor.close()
                connection.close()
                
                execution_time = int((time.time() - start_time) * 1000)
                
                return QueryResponse(
                    success=True,
                    columns=columns,
                    rows=formatted_rows,
                    rowCount=len(formatted_rows),
                    executionTime=execution_time
                )
                
            except ImportError:
                return QueryResponse(
                    success=False,
                    error="PyMySQL not installed"
                )
            except pymysql.err.Error as e:
                return QueryResponse(
                    success=False,
                    error=f"MySQL Error: {str(e)}"
                )
                
        elif request.db_type == 'postgresql':
            try:
                import psycopg2
                import psycopg2.extras
                
                connection = psycopg2.connect(
                    host=request.host,
                    port=request.port,
                    user=request.user,
                    password=request.password,
                    dbname=request.database,
                    connect_timeout=10
                )
                
                cursor = connection.cursor(cursor_factory=psycopg2.extras.DictCursor)
                cursor.execute(request.query)
                rows = cursor.fetchall()
                
                # Get column names
                columns = [desc[0] for desc in cursor.description] if cursor.description else []
                
                # Convert rows to list of dicts
                formatted_rows = []
                for row in rows:
                    formatted_row = {}
                    for key in columns:
                        value = row[key]
                        # Convert any non-serializable types to strings
                        if value is None:
                            formatted_row[key] = None
                        elif isinstance(value, (int, float, str, bool)):
                            formatted_row[key] = value
                        else:
                            formatted_row[key] = str(value)
                    formatted_rows.append(formatted_row)
                
                cursor.close()
                connection.close()
                
                execution_time = int((time.time() - start_time) * 1000)
                
                return QueryResponse(
                    success=True,
                    columns=columns,
                    rows=formatted_rows,
                    rowCount=len(formatted_rows),
                    executionTime=execution_time
                )
                
            except ImportError:
                return QueryResponse(
                    success=False,
                    error="psycopg2 not installed"
                )
            except psycopg2.Error as e:
                return QueryResponse(
                    success=False,
                    error=f"PostgreSQL Error: {str(e)}"
                )
        else:
            return QueryResponse(
                success=False,
                error=f"Unsupported database type: {request.db_type}"
            )
            
    except Exception as e:
        return QueryResponse(
            success=False,
            error=f"Unexpected error: {str(e)}"
        )

@app.get("/health")
def health_check():
    return {"status": "healthy"}

