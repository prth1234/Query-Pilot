# Query Pilot

_Query Pilot is an AI-powered universal database assistant that delivers intelligent SQL generation, schema-aware reasoning, cross-database compatibility, and automatic query correction. Designed for engineers who want to accelerate database workflows with next-gen AI._

---

## 🌟 Core Features

- 🚀 **Schema-aware SQL Generation**  
- 🔍 **Natural Language to SQL Conversion**  
- 🔄 **Automatic SQL Correction (Fix & Retry)**  
- 💡 **Query Optimization Insights & Explanations**  
- 🧠 **Error Explanation and Intelligent Debugging**  
- 🛠 **Cross-Database SQL Rewriting** (MySQL ↔ PostgreSQL ↔ Snowflake ↔ BigQuery, etc.)  
- ✨ **Context-aware Autocomplete**  
- 📊 **AI-guided Schema Exploration**  
- 🔗 **Intelligent JOIN & Relationship Inference**  
- 📝 **AI-generated Query Templates from Schema**  

---

## 🎨 User Experience

- **Modern UI** — Built with GitHub Primer  
- **Real-Time Connection Testing** — Includes detailed, animated timeline  
- **AI Reasoning Panel** — Gives explanations, corrections & suggestions  
- **Smart Workspace** — Schema-aware autocomplete, context-driven suggestions  
- **Multi-Database Support** — Modular, extensible backends  
- **Instant Validation** — Clean, responsive animations & feedback  
- **Smooth Transitions** — Designed for maximum productivity  

---

## 🗄️ Supported Databases

Query Pilot currently integrates with:

- MySQL
- PostgreSQL
- MariaDB
- SQLite
- SQL Server
- Oracle
- Snowflake
- BigQuery
- MongoDB *(AI-powered aggregation pipeline generation)*
- Databricks / Spark SQL

_Easily add support for new databases via the modular provider system._

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- One of the supported databases

### Option 1: One-Step Start

```bash
./start.sh
```
This script:
- Creates a Python virtual environment
- Installs backend dependencies
- Launches FastAPI backend (`localhost:8000`)
- Starts React frontend (`localhost:5173`)

---

### Option 2: Manual Start

#### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 2. Frontend

```bash
cd db-llm
npm install
npm run dev
```

---

### Usage Flow

1. **Select your database engine**
2. **Enter connection parameters**
3. **Run the connection test**
4. **Watch the animated timeline**
5. **Open the workspace**
6. **Query with natural language or SQL**
7. **Leverage the AI engine for generation, debugging, optimization, and more!**

---

## 🤖 SQL-SLM Capabilities

- Schema-aware SQL generation
- Multi-database SQL rewriting
- Intelligent autocorrect for invalid SQL
- Natural language to SQL generation
- Automatic join inference
- SQL debugging & explanations
- Query optimization suggestions
- Automatic formatting & aliasing
- Schema summarization & exploration
- Context-aware autocomplete

---

## 🗂️ Project Structure

```
Query-Pilot/
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
```

---

## 🛠 Backend API

### Test Database Connection
```http
POST /api/test-connection/{engine}
```

### Generate SQL from Natural Language
```http
POST /api/ai/generate-sql
```

### Fix Invalid SQL
```http
POST /api/ai/fix-sql
```

### Explain SQL
```http
POST /api/ai/explain-sql
```

**Docs:**  
- Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)  
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 💎 Animations & UI Details

- Smooth, accessible modals and transitions
- Step-by-step animated connection timeline
- State-based, context-driven UI feedback
- Clean, minimal interface design

---

## 🧩 Troubleshooting

- **Backend won't start?**  
  Activate virtual environment and reinstall dependencies

- **AI routes are failing?**  
  Ensure backend is running on port 8000

- **SQL generation issues?**  
  Verify your database connection and schema accessibility

---

## 🛣️ Roadmap

- Vector-based schema memory
- Local/offline SLM inference
- Agent-based advanced SQL generation
- Saved queries and query history
- Visual query planning & DAG viewer
- Intelligent index recommendations

---

## 📄 License

**MIT License** — Please see [LICENSE](./LICENSE).

---

## 🤝 Contributing

Contributions are very welcome!  
Open an issue or pull request any time.

---
