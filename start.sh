#!/bin/bash

# Database LLM - Start Script
# Starts both backend and frontend servers

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║             🚀 Database LLM - Starting Services               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if backend venv exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Backend virtual environment not found!"
    echo "   Please run ./setup.sh first to set up the project."
    echo ""
    exit 1
fi

# Check if frontend node_modules exists
if [ ! -d "db-llm/node_modules" ]; then
    echo "❌ Frontend node_modules not found!"
    echo "   Please run ./setup.sh first to set up the project."
    echo ""
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    
    if [ ! -z "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        kill $BACKEND_PID 2>/dev/null
        echo "   ✓ Backend stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        kill $FRONTEND_PID 2>/dev/null
        echo "   ✓ Frontend stopped"
    fi
    
    echo ""
    echo "👋 Goodbye!"
    exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM

# ============================================
# START BACKEND
# ============================================
echo "🔧 Starting FastAPI backend..."

cd "$SCRIPT_DIR/backend"
./venv/bin/python -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait a moment and check if backend started
sleep 2
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Failed to start backend!"
    echo "   Check backend/main.py for errors."
    exit 1
fi

echo "   ✓ Backend running on http://localhost:8000"
echo ""

# ============================================
# START FRONTEND
# ============================================
echo "🎨 Starting Vite frontend..."

cd "$SCRIPT_DIR/db-llm"
npm run dev &
FRONTEND_PID=$!

# Wait a moment and check if frontend started
sleep 2
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Failed to start frontend!"
    echo "   Check db-llm for errors."
    cleanup
    exit 1
fi

echo "   ✓ Frontend running on http://localhost:5173"
echo ""

# ============================================
# RUNNING
# ============================================
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║               ✨ All Services Running! ✨                     ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  Frontend:    http://localhost:5173                          ║"
echo "║  Backend:     http://localhost:8000                          ║"
echo "║  API Docs:    http://localhost:8000/docs                     ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  Press Ctrl+C to stop all services                           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
