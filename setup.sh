#!/bin/bash

# Database LLM - Full Setup Script
# This script completely resets and reinstalls all dependencies

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

# Remove existing virtual environment if present
if [ -d "venv" ]; then
    echo "🗑️  Removing existing Python virtual environment..."
    rm -rf venv
    echo "   ✓ Removed old venv"
fi

# Create new virtual environment
echo "📦 Creating new Python virtual environment..."
python3 -m venv venv
echo "   ✓ Created new venv"

# Activate and install dependencies
echo "📥 Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
echo "   ✓ Installed all Python packages"

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

# Remove existing node_modules if present
if [ -d "node_modules" ]; then
    echo "🗑️  Removing existing node_modules..."
    rm -rf node_modules
    echo "   ✓ Removed old node_modules"
fi

# Remove package-lock.json to ensure fresh install
if [ -f "package-lock.json" ]; then
    echo "🗑️  Removing existing package-lock.json..."
    rm -f package-lock.json
    echo "   ✓ Removed old package-lock.json"
fi

# Install dependencies
echo "📥 Installing Node.js dependencies..."
npm install
echo "   ✓ Installed all Node.js packages"

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
