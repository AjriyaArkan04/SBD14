#!/bin/bash

# Reservo Backend - Setup & Run Guide
# ====================================

echo "🚀 Reservo Backend - Quick Setup"
echo "=================================="
echo ""

# Step 1: Check if .env exists
echo "📝 Step 1: Checking .env file..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "   Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env created. Please edit with your Neon credentials."
else
    echo "✅ .env file found"
fi

echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ node_modules already exists"
fi

echo ""

# Step 3: Sync database
echo "🗄️  Step 3: Setting up database..."
read -p "   Ready to sync database? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run sync-db
else
    echo "   Skipped database setup"
fi

echo ""

# Step 4: Test connection
echo "🔍 Step 4: Testing connection..."
npm run test-connection

echo ""
echo "✨ Setup complete!"
echo ""
echo "🚀 To start development server, run:"
echo "   npm run dev"
echo ""
echo "📊 API will be available at:"
echo "   http://localhost:5000"
echo "   Health check: http://localhost:5000/api/health"
