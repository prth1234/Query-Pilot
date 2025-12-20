#!/bin/bash

# Database LLM - Full Setup Script
# This script completely resets and reinstalls all dependencies for both backend and frontend.

set -e  # Exit on any error

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           🛠️  Database LLM - Full Setup Script                ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ============================================
# BACKEND SETUP
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 SETTING UP BACKEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd backend

# 1. DELETE env/venv if it is there
if [ -d "venv" ]; then
    echo "1. 🗑️  Deleting existing virtual environment (venv)..."
    rm -rf venv
    echo "   ✓ Deleted venv"
else
    echo "1. ℹ️  No existing virtual environment found."
fi

# 2. CREATE venv
echo "2. 📦 Creating new virtual environment..."
python3 -m venv venv
echo "   ✓ Created new venv"

# 3. DOWNLOAD required packages (Setup everything)
echo "3. 📥 Activate venv and installing requirements..."
source venv/bin/activate
pip install --upgrade pip
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "   ✓ Installed requirements.txt"
else
    echo "   ⚠️  requirements.txt not found!"
fi

# Deactivate venv
deactivate
cd "$SCRIPT_DIR"

echo ""
echo "✅ Backend setup complete!"
echo ""

# ============================================
# FRONTEND SETUP
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎨 SETTING UP FRONTEND"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd db-llm

# 1. DELETE node_modules if it is there
if [ -d "node_modules" ]; then
    echo "1. 🗑️  Deleting existing node_modules..."
    rm -rf node_modules
    echo "   ✓ Deleted node_modules"
else
    echo "1. ℹ️  No existing node_modules found."
fi

# 2. DOWNLOAD modules again (npm install)
echo "2. 📥 Installing Node.js dependencies..."
npm install
echo "   ✓ Installed node modules"

cd "$SCRIPT_DIR"

echo ""
echo "✅ Frontend setup complete!"
echo ""

# ============================================
# DONE
# ============================================
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              ✨ SETUP COMPLETED SUCCESSFULLY! ✨              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "To start the application, run:"
echo ""
echo "    ./start.sh"
echo ""
