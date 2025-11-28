# QueryPilot

QueryPilot is a web-based AI assistant that connects to any database and helps you generate, fix, and optimize SQL queries from natural language. It simplifies querying, exploring schemas, and understanding your data.

---

## What it does
- Connect to any database (MySQL, PostgreSQL, SQL Server, Snowflake, BigQuery, MongoDB, etc.).
- Convert plain English → SQL instantly.
- Autocomplete and auto-suggest SQL as you type.
- Fix broken SQL and rewrite inefficient queries.
- Explain queries and results in simple language.
- Explore schemas, tables, columns, and relationships.
- Generate schemas or tables based on descriptions.
- Provide query recommendations and improvements.

---

## Core features

### Universal DB connection  
Add your credentials → QueryPilot connects securely and introspects your schema.

### AI SQL Generator  
“Top 10 customers by revenue last month” → SQL generated instantly.

### AI Autocomplete  
Smart completions based on your database structure and query intent.

### AI SQL Fixer  
Detects errors and automatically corrects invalid SQL.

### AI Query Optimizer  
Suggests faster versions of your queries.

### Schema Explorer  
Browse tables, columns, types, constraints.

### Schema Generator  
Describe a table → QueryPilot creates the full `CREATE TABLE` SQL.

### Natural-Language Explanations  
Explains what a query does, line by line.

---

## Getting started (Dev)

### 1. Clone
```bash
git clone https://github.com/yourorg/querypilot.git
cd querypilot

2. Install dependencies

npm install

3. Environment setup

OPENAI_API_KEY=your-key

4. Start the web app

npm run dev

5. Connect a database in the UI and start querying.

⸻

Example

Input:
Show me the top 10 regions where this tshirt sells the most

Output SQL:

SELECT region,
       SUM(quantity) AS total_quantity
FROM sales
WHERE product_name = :product
GROUP BY region
ORDER BY total_quantity DESC
LIMIT 10;


⸻

Project structure (simple)

/
├─ src/
│  ├─ components/
│  ├─ pages/
│  ├─ db/
│  ├─ ai/
│  └─ utils/
└─ public/

