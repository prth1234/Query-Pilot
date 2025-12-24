# Query Pilot

## Database Intelligence Platform

Query Pilot is an AI-powered universal database assistant that delivers intelligent SQL generation, schema-aware reasoning, cross-database compatibility, and automatic query correction. Designed for engineers who want to accelerate database workflows with next-gen AI.

---

## Core Features

### Query Processing
- Schema-aware SQL generation with cross-database compatibility
- Natural language to SQL conversion with semantic understanding
- Automatic SQL correction with fix-and-retry execution
- Query optimization insights and explanations
- Error explanation and intelligent debugging
- Cross-database SQL rewriting (MySQL ↔ PostgreSQL ↔ Snowflake ↔ BigQuery)
- Context-aware autocomplete with schema intelligence
- AI-guided schema exploration and relationship inference
- AI-generated query templates from schema patterns

### Performance Optimization
- Connection pooling with adaptive sizing
- Query result caching with TTL policies
- Parallel query execution for independent operations
- Query plan caching with signature-based invalidation
- Batch processing with parameter grouping
- Compressed network payloads for large result sets

---

## Supported Databases

## SQL Databases
- MySQL
- PostgreSQL
- Databricks / Spark SQL (Coming soon)
- Snowflake (Coming soon)
- BigQuery (Coming soon)
- MariaDB (Coming soon)
- SQLite (Coming soon)
- Oracle (Coming soon)

## NoSQL Databases
- MongoDB
- Neo4j (Coming soon)
- Apache Cassandra (Coming soon)
- Redis (Coming soon)
- Amazon DynamoDB (Coming soon)
- Couchbase (Coming soon)
- ArangoDB (Coming soon)
- OrientDB (Coming soon)

### Extensible Architecture
Modular provider system for adding new database support via standardized interfaces.

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- One of the supported databases

### Automated Setup
```bash
./start.sh
```

This script:
- Creates Python virtual environment
- Installs backend dependencies
- Launches FastAPI backend on localhost:8000
- Starts React frontend on localhost:5173

### Manual Setup

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd db-llm
npm install
npm run dev
```

---

## Usage Workflow

1. Select database engine from supported platforms
2. Enter connection parameters
3. Run connection test with validation
4. Open query workspace
5. Execute queries using natural language or SQL
6. Utilize AI features for generation, debugging, and optimization

---

## AI Query Engine Capabilities

- Schema-aware SQL generation using transformer models
- Multi-database SQL rewriting with dialect translation
- Intelligent SQL correction for syntax and semantic errors
- Natural language to SQL conversion with context understanding
- Automatic join inference using schema relationships
- SQL debugging with step-by-step explanations
- Query optimization suggestions based on execution plans
- Automatic query formatting and aliasing
- Schema summarization and exploration guidance

---

## Architecture

```
Query-Pilot/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── database/               # Database adapters and drivers
│   ├── ai/                     # AI model integration
│   ├── cache/                  # Caching implementation
│   └── requirements.txt        # Python dependencies
├── db-llm/
│   ├── src/                    # React frontend source
│   │   ├── App.jsx             # Main application component
│   │   ├── SQLAIEngine.jsx     # AI query engine interface
│   │   ├── DatabaseSelector.jsx # Database selection
│   │   ├── ConnectionForm.jsx  # Connection configuration
│   │   ├── Workspace.jsx       # Query workspace
│   │   └── components/         # UI components
│   └── package.json            # Frontend dependencies
└── start.sh                    # Startup script
```

---

## Backend API

### Test Database Connection
```http
POST /api/test-connection/{engine}
Content-Type: application/json

{
  "host": "localhost",
  "port": 5432,
  "database": "mydb",
  "username": "user",
  "password": "pass"
}
```

### Generate SQL from Natural Language
```http
POST /api/ai/generate-sql
Content-Type: application/json

{
  "natural_language": "Find all customers from New York",
  "schema": "customers(id, name, city, country)"
}
```

### Fix Invalid SQL
```http
POST /api/ai/fix-sql
Content-Type: application/json

{
  "sql": "SELECT * FORM customers WHERE city = 'New York'",
  "error": "syntax error near FORM"
}
```

### Explain SQL Query
```http
POST /api/ai/explain-sql
Content-Type: application/json

{
  "sql": "SELECT * FROM customers JOIN orders ON customers.id = orders.customer_id",
  "database_type": "postgresql"
}
```

### API Documentation
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Performance Features

### Connection Management
- Connection pooling with configurable min/max connections
- Connection multiplexing for efficient resource usage
- Connection validation and health checking
- Automatic reconnection on failure

### Caching System
- Query result caching with expiration policies
- Query plan caching to avoid repeated optimization
- Schema metadata caching for faster autocomplete
- LRU eviction policy for cache management

### Query Execution
- Parallel execution of independent queries
- Batch processing for parameterized statements
- Streaming results for large datasets
- Query timeout and cancellation support

### Resource Management
- Memory limits per query execution
- Result size limitations with pagination
- Concurrent query execution limits
- Query prioritization and queuing

---

## User Interface

- Modern interface built with GitHub Primer design system
- Real-time connection testing with visual feedback
- AI reasoning panel for explanations and suggestions
- Smart workspace with schema-aware autocomplete
- Responsive design for various screen sizes
- Smooth transitions and loading states
- Query history and saved queries
- Export functionality for query results

---

## Troubleshooting

### Common Issues
- **Backend won't start**: Ensure Python virtual environment is activated and dependencies installed
- **AI features not working**: Verify backend is running on port 8000 and accessible
- **Database connection failures**: Check connection parameters and network accessibility
- **SQL generation issues**: Ensure schema information is accessible and properly formatted
- **Performance problems**: Adjust connection pool settings and caching configurations

### Debugging Tools
- Detailed error messages with suggested fixes
- Query execution timing and profiling
- Connection pool statistics and monitoring
- Cache hit/miss ratios and performance metrics
- AI model response logging and analysis

---

## Roadmap

### Planned Features
- Vector-based schema memory for context retention
- Local/offline SLM inference for privacy-sensitive environments
- Agent-based advanced SQL generation with multi-step reasoning
- Saved queries and query history with versioning
- Visual query planning and execution DAG viewer
- Intelligent index recommendations based on query patterns
- Query template library with community contributions
- Advanced visualization for query results
- Collaborative query editing and sharing
- Scheduled query execution and alerting

---

## Development

### Adding New Database Support
1. Create new adapter in `backend/database/adapters/`
2. Implement standard database interface methods
3. Add database-specific SQL dialect handling
4. Register adapter in database factory
5. Update frontend database selector component

### Extending AI Capabilities
1. Add new AI endpoint in `backend/ai/routes.py`
2. Implement corresponding service logic
3. Create frontend component for new feature
4. Add to workspace interface
5. Update documentation

### Building from Source
```bash
# Clone repository
git clone https://github.com/querypilot/query-pilot.git
cd query-pilot

# Setup development environment
./scripts/setup-dev.sh

# Run tests
./scripts/run-tests.sh

# Build for production
./scripts/build-prod.sh
```

---

## License

MIT License - See LICENSE file for details.

---

## Contributing

Contributions are welcome. Please review the contribution guidelines before submitting pull requests.
