# Query Pilot 

A modern database connection interface with beautiful UI and real-time connection testing.

## ✨ Features

- 🎨 **Modern UI** - Built with GitHub Primer components with stunning animations
- 🔄 **Real-time Connection Testing** - Watch each step of the connection process
- 🎭 **Genie Animation** - Beautiful modal with smooth animations
- ✅ **Live Validation** - Instant feedback on your credentials
- 🗄️ **MySQL Support** - Currently supports MySQL (more databases coming soon)
- 🎯 **Timeline Visualization** - See connection progress step-by-step

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- MySQL database (for testing connections)

### Option 1: Auto Start (Recommended)

Run both frontend and backend together:

```bash
./start.sh
```

This will:
- Set up Python virtual environment (first time only)
- Install backend dependencies (first time only)
- Start FastAPI backend on port 8000
- Start React frontend on port 5173

### Option 2: Manual Start

#### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd db-llm
npm install  # If not already done
npm run dev
```

## 🎯 Usage

1. **Select Database**: Choose MySQL from the database selector
2. **Enter Credentials**: Fill in your database connection details
   - Host (e.g., localhost)
   - Port (e.g., 3306)
   - Database name
   - Username
   - Password
3. **Test Connection**: Click "Test Connection" button
4. **Watch Magic**: See the beautiful genie animation and connection timeline
5. **Success**: Navigate to workspace if connection is successful
6. **Retry**: If connection fails, adjust credentials and try again

## 🏗️ Project Structure

```
database-llm/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── README.md           # Backend docs
├── db-llm/
│   ├── src/
│   │   ├── App.jsx                    # Main application
│   │   ├── ConnectionForm.jsx         # Connection form
│   │   ├── ConnectionTestModal.jsx    # Animated modal
│   │   ├── Workspace.jsx              # Post-connection workspace
│   │   ├── DatabaseSelector.jsx       # DB selection
│   │   └── ...
│   └── package.json
└── start.sh                # Quick start script
```

## 🎨 UI Features

### Connection Test Modal

- **Genie Animation**: Smooth appearance from button
- **Timeline Steps**: Each connection step appears sequentially
- **Status Indicators**: 
  - 🔵 In Progress (pulsing animation)
  - ✅ Completed (success pop)
  - ❌ Failed (shake animation)
- **Error Details**: Clear error messages for troubleshooting

### Form Validation

- Real-time validation as you type
- Green checkmark for valid fields
- Red border and message for invalid fields
- Shake animation on errors

## 🔧 Backend API

### Endpoints

**POST** `/api/test-connection/mysql`

Test MySQL database connection.

**Request:**
```json
{
  "host": "localhost",
  "port": 3306,
  "database": "mydb",
  "user": "root",
  "password": "password"
}
```

**Response (Success):**
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
    },
    ...
  ],
  "error": null
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Access denied for user 'root'",
  "steps": [...],
  "error": "Access denied..."
}
```

### API Documentation

When backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🎭 Animations

- **Genie Effect**: Modal appears with a genie-from-bottle animation
- **Timeline Steps**: Sequentially animate in (400ms intervals)
- **Pulse Animation**: Active step indicator pulses
- **Success Pop**: Checkmark pops in on completion
- **Error Shake**: Failed steps shake to draw attention
- **Smooth Transitions**: All state changes are smoothly animated

## 🐛 Troubleshooting

### Backend Not Starting

```bash
# Make sure you're in the virtual environment
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Not Showing Modal

Check browser console for errors. Ensure backend is running on port 8000.

### Connection Fails

Common issues:
- MySQL server not running
- Incorrect credentials
- Firewall blocking connection
- Database doesn't exist

Check the error message in the modal for specific details.

## 🚧 Roadmap

- [ ] PostgreSQL support
- [ ] MongoDB support
- [ ] Snowflake support
- [ ] BigQuery support
- [ ] Databricks support
- [ ] Connection history
- [ ] Saved connections
- [ ] Query editor in workspace

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

Made with ❤️ using React, FastAPI, and GitHub Primer
