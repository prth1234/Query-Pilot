# Query Pilot  

An AI-powered universal database assistant that delivers intelligent SQL generation, schema-aware reasoning, cross-database compatibility, and automatic query correction. Designed for engineers who want a smarter and faster way to work with data.

## Core Focus

Query Pilot is built around an internal SQL-Specialized Language Model (SQL-SLM) capable of:

- Schema-aware SQL generation  
- Natural language to SQL conversion  
- Automatic SQL autocorrect and fix-and-retry  
- Query optimization insights  
- Error explanation and intelligent debugging  
- Cross-database SQL rewriting (MySQL → PostgreSQL → Snowflake → BigQuery, etc.)  
- Context-aware autocomplete  
- AI-guided schema exploration  
- Intelligent JOIN and relationship inference  
- AI-generated query templates based on schema  

## Features

- Modern UI built using GitHub Primer  
- Real-time connection testing with detailed timeline  
- AI reasoning panel with explanations, corrections, and suggestions  
- Schema-aware autocomplete in the workspace  
- Multi-database support through modular backends  
- Instant validation and clean animations  
- Smooth transitions and responsive design  

## Supported Databases

Query Pilot supports a wide range of engines:

- MySQL  
- PostgreSQL  
- MariaDB  
- SQLite  
- SQL Server  
- Oracle  
- Snowflake  
- BigQuery  
- MongoDB (aggregation pipeline generation)  
- Databricks / Spark SQL  

New databases can be added easily through the provider system.

## Quick Start

### Prerequisites
- Node.js 18+  
- Python 3.8+  
- Any supported database

### Option 1: Auto Start


./start.sh

This script:
	•	Creates virtual environment
	•	Installs backend dependencies
	•	Starts FastAPI backend (port 8000)
	•	Starts React frontend (port 5173)

Option 2: Manual Start

Backend

cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

Frontend

cd db-llm
npm install
npm run dev

Usage
	1.	Select the database engine
	2.	Enter connection details
	3.	Run the connection test
	4.	View the animated timeline
	5.	Access the workspace
	6.	Use natural language or SQL
	7.	Leverage the AI engine for generation, debugging, optimization, and corrections

SQL-SLM Capabilities (Top 10)
	•	Schema-aware SQL generation
	•	Multi-database SQL rewriting
	•	Intelligent autocorrect for invalid SQL
	•	Natural-language to SQL generation
	•	Automatic join inference
	•	SQL debugging and explanations
	•	Query optimization suggestions
	•	Automatic formatting and aliasing
	•	Schema summarization and exploration
	•	Context-aware autocomplete

Project Structure

database-llm/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
├── db-llm/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── SQLAIEngine.jsx
│   │   ├── DatabaseSelector.jsx
│   │   ├── ConnectionForm.jsx
│   │   ├── Workspace.jsx
│   │   └── ...
│   └── package.json
└── start.sh

Backend API

Test database connection

POST /api/test-connection/{engine}

Generate SQL

POST /api/ai/generate-sql

Fix invalid SQL

POST /api/ai/fix-sql

Explain SQL

POST /api/ai/explain-sql

Documentation:
	•	Swagger: http://localhost:8000/docs
	•	ReDoc: http://localhost:8000/redoc

Animations and UI
	•	Smooth modals and transitions
	•	Step-by-step connection timeline
	•	State-based UI feedback
	•	Clean, minimal interface

Troubleshooting

Backend not starting

Activate virtual environment and reinstall dependencies.

AI routes not working

Check if backend is running on port 8000.

SQL generation issues

Verify database connection and schema accessibility.

Roadmap
	•	Vector-based schema memory
	•	Local/offline SLM inference
	•	Agent-based advanced SQL generation
	•	Saved queries and history
	•	Visual query planning and DAG viewer
	•	Index recommendations

License

MIT License

Contributing

Contributions are welcome. Submit an issue or pull request anytime.
