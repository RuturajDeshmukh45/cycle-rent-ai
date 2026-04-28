# 🚲 CycleRent AI — Full Stack Cycle Rental System

A production-ready full-stack web app with AI-powered smart pricing, demand prediction, and route recommendations.

## 🛠️ Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Auth**: JWT Token
- **AI**: Rule-based smart pricing & recommendation engine

---

## 📁 Project Structure
```
cycle-rent-ai/
├── backend/          ← Node.js + Express + Sequelize
│   └── src/
│       ├── config/   ← DB & JWT config
│       ├── models/   ← Sequelize models
│       ├── controllers/
│       ├── repositories/
│       ├── routes/
│       ├── services/ ← AI pricing & recommendation
│       ├── middleware/
│       └── utils/
├── web/              ← React web app
│   └── src/
│       ├── pages/    ← 10 screens
│       ├── components/
│       ├── services/ ← API calls
│       ├── context/  ← Auth context
│       └── hooks/
└── mobile/           ← React Native (folder structure ready)
```

---

## ⚡ Quick Setup

### 1. MySQL Setup
```sql
CREATE DATABASE cycle_rent_db;
CREATE USER 'cycleuser'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON cycle_rent_db.* TO 'cycleuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend Setup
```bash
cd backend
cp ../.env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
# Server: http://localhost:5000
# DB tables auto-created, sample cycles auto-seeded
```

### 3. Web Frontend Setup
```bash
cd web
npm install
npm run dev
# App: http://localhost:5173
```

---

## 🔐 Default Credentials
Register a new account or create admin manually in DB:
```sql
-- After running the server, to make someone admin:
UPDATE users SET role='admin' WHERE email='your@email.com';
```
Demo hint in Login page: `admin@cyclerent.com / admin123`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Register |
| POST | /api/auth/login | ❌ | Login |
| GET | /api/auth/profile | ✅ | Get profile |
| PUT | /api/auth/profile | ✅ | Update profile |

### Cycles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/cycles | ✅ | Get all cycles |
| GET | /api/cycles/:id | ✅ | Get cycle by ID |
| POST | /api/cycles | ✅ Admin | Create cycle |
| PUT | /api/cycles/:id | ✅ Admin | Update cycle |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/bookings | ✅ | Create booking |
| PUT | /api/bookings/:id/complete | ✅ | Complete ride |
| PUT | /api/bookings/:id/cancel | ✅ | Cancel booking |
| GET | /api/bookings/my-rides | ✅ | My rides |
| GET | /api/bookings/history | ✅ | Ride history |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/ai/pricing | ✅ | Dynamic pricing |
| GET | /api/ai/recommendations | ✅ | AI suggestions |
| GET | /api/ai/analytics | ✅ | Analytics data |

---

## 🤖 AI Features
- **Smart Pricing**: 1.5× during peak hours (7-10am, 5-8pm), 1.3× weekends
- **Demand Prediction**: Simulated demand scores per hour of day
- **Route Suggestions**: Top 4 popular routes with ratings
- **User Insights**: Personal ride analytics

---

## 📱 Screens (Web)
1. Login / Register
2. Dashboard (nearby cycles, quick rent)
3. Cycle Details
4. Booking Page (AI pricing shown)
5. My Rides (active + manage)
6. Ride History
7. Map View (station browser)
8. AI Insights (charts + recommendations)
9. Profile

---

## 🗄️ Database Tables
- `users` — Authentication & profile
- `cycles` — Cycle inventory
- `bookings` — Active/past bookings
- `ride_history` — Completed rides analytics
