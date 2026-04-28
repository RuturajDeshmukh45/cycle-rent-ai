#!/bin/bash
echo "🚲 Setting up CycleRent AI..."

echo "📦 Installing backend dependencies..."
cd backend && npm install
cd ..

echo "🌐 Installing web frontend dependencies..."
cd web && npm install
cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Create MySQL database: CREATE DATABASE cycle_rent_db;"
echo "2. Copy: cp .env.example backend/.env"
echo "3. Edit backend/.env with your MySQL credentials"
echo "4. Run backend: cd backend && npm run dev"
echo "5. Run web: cd web && npm run dev"
echo ""
echo "🌍 Backend: http://localhost:5000"
echo "🌍 Web App: http://localhost:5173"
