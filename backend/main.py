from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time
from urllib.parse import quote_plus, unquote_plus

def fix_mongodb_uri(uri: str) -> str:
    """
    Attempts to fix a MongoDB URI by url-encoding the username and password fields.
    This handles cases where users paste raw strings with special characters (like @) in passwords.
    """
    try:
        # Check prefix
        prefix = ""
        if uri.startswith("mongodb://"):
            prefix = "mongodb://"
            rest = uri[10:]
        elif uri.startswith("mongodb+srv://"):
            prefix = "mongodb+srv://"
            rest = uri[14:]
        else:
            return uri
            
        # Separate query params
        query_part = ""
        if "?" in rest:
            rest, query_part = rest.split("?", 1)
            query_part = "?" + query_part
            
        # Find the last '@' which separates auth from host
        if "@" not in rest:
            return uri
            
        last_at_index = rest.rfind("@")
        auth_section = rest[:last_at_index]
        host_section = rest[last_at_index+1:]
        
        # Split auth into user and pass
        if ":" in auth_section:
            # Split by first colon
            username, password = auth_section.split(":", 1)
            
            # Encode them (only if they seem unencoded? No, always encode is safer if we are fixing)
            # But wait, if they are ALREADY encoded, we might double encode.
            # Simple heuristic: if we are here, it's because pymongo failed.
            # So likely they are NOT encoded.
            
            # However, we must be careful not to encode an already valid string if we use this proactively.
            # But we will use this function ONLY in the except block when it failed. So we assume it's broken.
            
            encoded_user = quote_plus(username)
            encoded_pass = quote_plus(password)
            
            return f"{prefix}{encoded_user}:{encoded_pass}@{host_section}{query_part}"
            
        return uri
    except Exception:
        return uri

def inject_credentials(uri: str, username: str, password: str) -> str:
    """
    Injects or replaces credentials in a MongoDB URI with properly encoded values.
    """
    try:
        prefix = ""
        rest = ""
        if uri.startswith("mongodb://"):
            prefix = "mongodb://"
            rest = uri[10:]
        elif uri.startswith("mongodb+srv://"):
            prefix = "mongodb+srv://"
            rest = uri[14:]
        else:
            # Fallback for unknown prefix, just assume standard format
            if "://" in uri:
                parts = uri.split("://", 1)
                prefix = parts[0] + "://"
                rest = parts[1]
            else:
                return uri

        # Encode credentials
        encoded_user = quote_plus(username)
        encoded_pass = quote_plus(password)
        creds = f"{encoded_user}:{encoded_pass}"
        
        # Check if there are existing credentials
        if "@" in rest:
            # Replace existing auth section
            # Find the LAST @ to separate host (in case user used @ in password previously without encoding)
            last_at_index = rest.rfind("@")
            host_part = rest[last_at_index+1:]
            return f"{prefix}{creds}@{host_part}"
        else:
            # Insert credentials
            return f"{prefix}{creds}@{rest}"
    except Exception:
        return uri

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

class MongoDBConnectionRequest(BaseModel):
    connectionString: str
    database: str
    username: Optional[str] = "" # Kept for backward compat but usually empty
    password: Optional[str] = "" # Kept for backward compat but usually empty

class SchemaRequest(BaseModel):
    """Unified schema request for all database types"""
    host: Optional[str] = None
    port: Optional[int] = None
    database: str
    user: Optional[str] = None
    password: Optional[str] = None
    db_type: Optional[str] = None  # 'mysql', 'postgresql', or 'mongodb'
    connectionString: Optional[str] = None  # For MongoDB
    username: Optional[str] = None  # For MongoDB

class ConnectionResponse(BaseModel):
    success: bool
    message: str
    steps: list[dict]
    error: Optional[str] = None

class QueryRequest(BaseModel):
    query: str
    host: Optional[str] = None
    port: Optional[int] = None
    database: str
    user: Optional[str] = None
    password: Optional[str] = None
    db_type: str  # 'mysql', 'postgresql', or 'mongodb'
    connectionString: Optional[str] = None  # For MongoDB
    username: Optional[str] = None  # For MongoDB (alternative to 'user')

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
                
        elif request.db_type == 'mongodb':
            try:
                from pymongo import MongoClient
                from pymongo.errors import PyMongoError
                import json
                from urllib.parse import urlparse, quote_plus
                
                if not request.connectionString:
                    return QueryResponse(
                        success=False,
                        error="Connection string is required for MongoDB"
                    )
                
                conn_str = request.connectionString
                
                # Override credentials if provided
                if request.username and request.password:
                    conn_str = inject_credentials(conn_str, request.username, request.password)
                
                # Connect to MongoDB
                try:
                    client = MongoClient(conn_str, serverSelectionTimeoutMS=10000)
                except Exception as e:
                    if "RFC 3986" in str(e) or "must be escaped" in str(e).lower():
                        fixed_uri = fix_mongodb_uri(conn_str)
                        client = MongoClient(fixed_uri, serverSelectionTimeoutMS=10000)
                    else:
                        raise e

                # Use the explicitly requested database and ignore any database in connection string
                db = client[request.database]
                
                # Parse the query - expect JSON format
                # Format: {"collection": "users", "query": {...}, "limit": 1000}
                # or {"collection": "users", "aggregate": [...]}
                try:
                    query_obj = json.loads(request.query)
                except json.JSONDecodeError:
                    client.close()
                    return QueryResponse(
                        success=False,
                        error="Invalid JSON query format. Expected: {\"collection\": \"name\", \"query\": {...}} or {\"collection\": \"name\", \"aggregate\": [...]}"
                    )
                
                if 'collection' not in query_obj:
                    client.close()
                    return QueryResponse(
                        success=False,
                        error="Query must specify 'collection' field"
                    )
                
                # Parse collection name to handle "database.collection" format
                collection_name = query_obj.get('collection')
                if not collection_name:
                    client.close()
                    return QueryResponse(success=False, error="Query must specify 'collection' field")
                
                target_db = None
                target_coll = None
                
                if '.' in collection_name:
                    parts = collection_name.split('.', 1)
                    target_db_name = parts[0]
                    target_coll_name = parts[1]
                    target_db = client[target_db_name]
                    target_coll = target_db[target_coll_name]
                else:
                    # Fallback to requested database if no prefix
                    target_db = client[request.database]
                    target_coll = target_db[collection_name]
                
                # Execute query
                if 'aggregate' in query_obj:
                    # Aggregation pipeline
                    pipeline = query_obj['aggregate']
                    cursor = target_coll.aggregate(pipeline)
                    results = list(cursor)
                else:
                    # Regular find query
                    find_query = query_obj.get('query', {})
                    projection = query_obj.get('projection', None)
                    limit = query_obj.get('limit', 1000)
                    sort = query_obj.get('sort', None)
                    
                    cursor = target_coll.find(find_query, projection)
                    if sort:
                        cursor = cursor.sort(sort)
                    cursor = cursor.limit(limit)
                    results = list(cursor)
                
                # Convert MongoDB documents to tabular format
                if not results:
                    client.close()
                    return QueryResponse(
                        success=True,
                        columns=[],
                        rows=[],
                        rowCount=0,
                        executionTime=int((time.time() - start_time) * 1000)
                    )
                
                # Get all unique keys from all documents
                all_keys = set()
                for doc in results:
                    all_keys.update(doc.keys())
                
                columns = sorted(list(all_keys))
                
                # Convert documents to rows
                formatted_rows = []
                for doc in results:
                    row = {}
                    for key in columns:
                        value = doc.get(key)
                        # Convert ObjectId and other MongoDB types to strings
                        if value is None:
                            row[key] = None
                        elif isinstance(value, (int, float, str, bool)):
                            row[key] = value
                        else:
                            row[key] = str(value)
                    formatted_rows.append(row)
                
                client.close()
                
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
                    error="pymongo not installed"
                )
            except PyMongoError as e:
                return QueryResponse(
                    success=False,
                    error=f"MongoDB Error: {str(e)}"
                )
            except Exception as e:
                return QueryResponse(
                    success=False,
                    error=f"Error: {str(e)}"
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

@app.post("/api/schema")
async def get_database_schema(request: SchemaRequest):
    """
    Fetch database schema (tables/collections and columns/fields) for autocomplete.
    Returns table/collection names, column/field names, and data types.
    """
    try:
        db_type = request.db_type
        
        # Try to determine database type based on port if not specified
        if not db_type:
            if request.port == 3306:
                db_type = 'mysql'
            elif request.port == 5432:
                db_type = 'postgresql'
            elif request.connectionString:
                db_type = 'mongodb'
            else:
                db_type = 'mysql'  # Default
        
        if db_type == 'mysql':
            try:
                import pymysql
                
                connection = pymysql.connect(
                    host=request.host,
                    port=request.port,
                    user=request.user,
                    password=request.password,
                    database=request.database,
                    connect_timeout=10
                )
                
                cursor = connection.cursor()
                
                # Get all tables
                cursor.execute("SHOW TABLES")
                tables_result = cursor.fetchall()
                
                schema = {
                    "tables": [],
                    "keywords": ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", 
                                "INNER JOIN", "OUTER JOIN", "ON", "AND", "OR", "ORDER BY", 
                                "GROUP BY", "HAVING", "LIMIT", "OFFSET", "AS", "DISTINCT",
                                "COUNT", "SUM", "AVG", "MAX", "MIN", "INSERT", "UPDATE", 
                                "DELETE", "CREATE", "DROP", "ALTER", "TABLE", "INDEX",
                                "PRIMARY KEY", "FOREIGN KEY", "NOT NULL", "UNIQUE", "DEFAULT"]
                }
                
                # For each table, get columns
                for table_row in tables_result:
                    table_name = table_row[0]
                    
                    # Get column information
                    cursor.execute(f"DESCRIBE `{table_name}`")
                    columns_result = cursor.fetchall()
                    
                    columns = []
                    for col in columns_result:
                        columns.append({
                            "name": col[0],
                            "type": col[1],
                            "nullable": col[2] == "YES",
                            "key": col[3],
                            "default": col[4],
                            "extra": col[5]
                        })
                    
                    schema["tables"].append({
                        "name": table_name,
                        "columns": columns
                    })
                
                cursor.close()
                connection.close()
                
                return schema
                
            except ImportError:
                raise HTTPException(status_code=500, detail="PyMySQL not installed")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")
        
        elif db_type == 'postgresql':
            try:
                import psycopg2
                
                connection = psycopg2.connect(
                    host=request.host,
                    port=request.port,
                    user=request.user,
                    password=request.password,
                    dbname=request.database,
                    connect_timeout=10
                )
                
                cursor = connection.cursor()
                
                # Get all tables from public schema
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_type = 'BASE TABLE'
                """)
                tables_result = cursor.fetchall()
                
                schema = {
                    "tables": [],
                    "keywords": ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", 
                                "INNER JOIN", "OUTER JOIN", "ON", "AND", "OR", "ORDER BY", 
                                "GROUP BY", "HAVING", "LIMIT", "OFFSET", "AS", "DISTINCT",
                                "COUNT", "SUM", "AVG", "MAX", "MIN", "INSERT", "UPDATE", 
                                "DELETE", "CREATE", "DROP", "ALTER", "TABLE", "INDEX",
                                "PRIMARY KEY", "FOREIGN KEY", "NOT NULL", "UNIQUE", "DEFAULT"]
                }
                
                # For each table, get columns
                for table_row in tables_result:
                    table_name = table_row[0]
                    
                    # Get column information
                    cursor.execute("""
                        SELECT column_name, data_type, is_nullable, column_default
                        FROM information_schema.columns
                        WHERE table_schema = 'public' AND table_name = %s
                        ORDER BY ordinal_position
                    """, (table_name,))
                    columns_result = cursor.fetchall()
                    
                    columns = []
                    for col in columns_result:
                        columns.append({
                            "name": col[0],
                            "type": col[1],
                            "nullable": col[2] == "YES",
                            "default": col[3]
                        })
                    
                    schema["tables"].append({
                        "name": table_name,
                        "columns": columns
                    })
                
                cursor.close()
                connection.close()
                
                return schema
                
            except ImportError:
                raise HTTPException(status_code=500, detail="psycopg2 not installed")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"PostgreSQL error: {str(e)}")
        
        elif db_type == 'mongodb':
            try:
                from pymongo import MongoClient
                from urllib.parse import urlparse, quote_plus
                
                if not conn_str:
                    raise HTTPException(status_code=400, detail="Connection string required for MongoDB")
                
                # Override credentials if provided
                if request.username and request.password:
                    conn_str = inject_credentials(conn_str, request.username, request.password)

                try:
                    client = MongoClient(conn_str, serverSelectionTimeoutMS=10000)
                except Exception as e:
                    if "RFC 3986" in str(e) or "must be escaped" in str(e).lower():
                        fixed_uri = fix_mongodb_uri(conn_str)
                        client = MongoClient(fixed_uri, serverSelectionTimeoutMS=10000)
                    else:
                        raise e
                        
                # Use explicit database name
                db = client[request.database]
                
                # Get all databases
                total_databases = client.list_database_names()
                
                # Filter out system databases for schema
                user_dbs = [d for d in total_databases if d not in ['admin', 'config', 'local']]
                
                schema = {
                    "tables": [],
                    "keywords": ["find", "aggregate", "match", "group", "sort", "limit", 
                                "project", "lookup", "unwind", "sum", "avg", "count",
                                "insert", "update", "delete", "collection"]
                }
                
                # Iterate through all user databases
                for db_name in user_dbs:
                    db = client[db_name]
                    collection_names = db.list_collection_names()
                    
                    for coll_name in collection_names:
                        collection = db[coll_name]
                        full_table_name = f"{db_name}.{coll_name}"
                        
                        # Sample first 100 documents to infer fields
                        sample_docs = list(collection.find().limit(100))
                        
                        # Get all unique fields
                        fields = set()
                        for doc in sample_docs:
                            fields.update(doc.keys())
                        
                        # Create column info
                        columns = []
                        for field in sorted(fields):
                            # Try to infer type from first occurrence
                            field_type = "mixed"
                            for doc in sample_docs:
                                if field in doc:
                                    value = doc[field]
                                    if isinstance(value, str):
                                        field_type = "string"
                                    elif isinstance(value, int):
                                        field_type = "int"
                                    elif isinstance(value, float):
                                        field_type = "double"
                                    elif isinstance(value, bool):
                                        field_type = "boolean"
                                    elif isinstance(value, list):
                                        field_type = "array"
                                    elif isinstance(value, dict):
                                        field_type = "object"
                                    else:
                                        field_type = str(type(value).__name__)
                                    break
                            
                            columns.append({
                                "name": field,
                                "type": field_type
                            })
                        
                        schema["tables"].append({
                            "name": full_table_name,
                            "columns": columns
                        })
                
                client.close()
                return schema
                
            except ImportError:
                raise HTTPException(status_code=500, detail="pymongo not installed")
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"MongoDB error: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported database type: {db_type}")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# MongoDB test connection endpoint
@app.post("/api/test-connection/mongodb", response_model=ConnectionResponse)
async def test_mongodb_connection(request: MongoDBConnectionRequest):
    """
    Test MongoDB database connection with provided credentials.
    Returns success status and detailed steps of the connection process.
    """
    steps = []
    
    try:
        # Step 1: Validate credentials format
        steps.append({
            "id": 1,
            "label": "Validating connection string",
            "status": "in_progress",
            "timestamp": time.time()
        })
        
        if not request.connectionString:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = "Missing connection string"
            return ConnectionResponse(
                success=False,
                message="Connection string is required",
                steps=steps,
                error="Missing connection string"
            )
            
        time.sleep(0.3)
        steps[-1]["status"] = "completed"
        
        # Step 2: Establishing connection
        steps.append({
            "id": 2,
            "label": "Establishing connection",
            "status": "in_progress",
            "timestamp": time.time()
        })
        
        try:
            from pymongo import MongoClient
            from pymongo.errors import ConnectionFailure, OperationFailure, ServerSelectionTimeoutError
            
            # Use connection string explicitly
            conn_str = request.connectionString
            
            # Override credentials if provided (This handles escaping automatically)
            if request.username and request.password:
                conn_str = inject_credentials(conn_str, request.username, request.password)
            
            # Try to connect
            try:
                client = MongoClient(conn_str, serverSelectionTimeoutMS=10000)
                # Force a check to validate the URI format immediately
                client.admin.command('ping')
            except Exception as e:
                # If error is about escaping, try to fix it
                if "RFC 3986" in str(e) or "must be escaped" in str(e).lower():
                    print(f"Attempting to fix MongoDB URI: {conn_str}") 
                    fixed_uri = fix_mongodb_uri(conn_str)
                    client = MongoClient(fixed_uri, serverSelectionTimeoutMS=10000)
                else:
                    raise e
            
            steps[-1]["status"] = "completed"
            
        except ImportError:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = "pymongo not installed"
            return ConnectionResponse(
                success=False,
                message="pymongo driver not found. Please install: pip install pymongo",
                steps=steps,
                error="pymongo not installed"
            )
        except ServerSelectionTimeoutError as e:
            steps[-1]["status"] = "failed"
            error_msg = str(e)
            steps[-1]["error"] = "Connection timeout"
            return ConnectionResponse(
                success=False,
                message=f"Cannot reach MongoDB server. Check connection string and network.",
                steps=steps,
                error="Connection timeout"
            )
        except ConnectionFailure as e:
            steps[-1]["status"] = "failed"
            error_msg = str(e)
            steps[-1]["error"] = "Connection failed"
            return ConnectionResponse(
                success=False,
                message=f"Connection failed: {error_msg}",
                steps=steps,
                error="Connection failed"
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
            "status": "in_progress",
            "timestamp": time.time()
        })
        
        try:
            # Ping the server to verify connection
            client.admin.command('ping')
            steps[-1]["status"] = "completed"
        except OperationFailure as e:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = "Authentication failed"
            client.close()
            return ConnectionResponse(
                success=False,
                message="Authentication failed. Please check your credentials.",
                steps=steps,
                error="Authentication failed"
            )
        except Exception as e:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = str(e)
            client.close()
            return ConnectionResponse(
                success=False,
                message=f"Authentication error: {str(e)}",
                steps=steps,
                error=str(e)
            )
        
        # Step 4: Checking database access
        steps.append({
            "id": 4,
            "label": "Checking database access",
            "status": "in_progress",
            "timestamp": time.time()
        })
        
        try:
            # Access the requested database
            db = client[request.database]
            
            # Also verify we can list databases (Cluster access)
            all_dbs = client.list_database_names()
            
            steps[-1]["status"] = "completed"
            steps[-1]["message"] = f"Found {len(all_dbs)} databases in cluster"
            
        except Exception as e:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = str(e)
            client.close()
            return ConnectionResponse(
                success=False,
                message=f"Database access error: {str(e)}",
                steps=steps,
                error=str(e)
            )
        
        # Step 5: Testing query privileges
        steps.append({
            "id": 5,
            "label": "Testing query privileges",
            "status": "in_progress", 
            "timestamp": time.time()
        })
        
        try:
            # Test a simple find operation
            collections = db.list_collection_names()
            if collections:
                # Use first collection for test
                test_collection = db[collections[0]]
                test_collection.find_one()
            
            steps[-1]["status"] = "completed"
            
        except Exception as e:
            steps[-1]["status"] = "failed"
            steps[-1]["error"] = str(e)
            client.close()
            return ConnectionResponse(
                success=False,
                message=f"Query privilege test failed: {str(e)}",
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
        client.close()
        
        return ConnectionResponse(
            success=True,
            message=f"Successfully connected to MongoDB Cluster. Found {len(all_dbs)} databases.",
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
