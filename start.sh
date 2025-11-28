#!/bin/bash

# Database LLM - Quick Start Script

echo "🚀 Database LLM Quick Start"
echo "============================"
echo ""

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "📦 Setting up backend..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
    echo "✅ Backend setup complete!"
    echo ""
fi

# Start backend in background
echo "🔧 Starting FastAPI backend..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..
echo "✅ Backend running on http://localhost:8000"
echo ""

# Wait for backend to start
sleep 2

# Start frontend
echo "🎨 Starting Vite frontend..."
cd db-llm
npm run dev &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend running on http://localhost:5173"
echo ""

echo "================================"
echo "✨ All services are running!"
echo "================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
