# CardboardOS 🏭

> A full-stack AI-powered factory management platform for the cardboard manufacturing industry.

Built as a capstone project demonstrating full-stack development,
data analytics, and machine learning in a real-world industrial context.

---

## Live Demo
🔗 Coming soon (deploying on Day 15)

**Demo credentials:**
- Email: `admin@cardboardos.com`
- Password: `test1234`

---

## Platform Overview

CardboardOS is a comprehensive web application that manages every operational
layer of a cardboard manufacturer — from raw material procurement to customer
delivery — with AI-powered forecasting and insights throughout.

---

## Modules

| Module | Description | Key Features |
|---|---|---|
| 📊 Dashboard | Real-time factory overview | 8 live KPIs, production charts, module status |
| 📦 Orders | Client order management | Status state machine, filter tabs, CRUD |
| 🏭 Production | Machine run tracking | Scrap logging, shift analysis, yield charts |
| 👷 Workforce | Shift scheduling | Operator management, shift calendar |
| 🛒 Procurement | Supplier intelligence | Price history, reliability scoring |
| 🚚 Logistics | Dispatch tracking | Order lifecycle, overdue alerts |
| 💰 Pricing Engine | Quote generation | Live material cost + margin calculator |
| ♻️ Waste Tracker | Scrap analytics | Pareto analysis, trend charts |
| 🌿 ESG | Sustainability tracking | Energy, water, carbon metrics |
| 🤖 AI Forecast | Demand + price forecasting | Meta Prophet ML models |
| 🔍 Waste ML | Clustering insights | KMeans waste pattern detection |
| 📐 Box Optimizer | Nesting algorithm | 2D bin-packing, canvas visualization |

---

## Tech Stack

### Frontend
- React 18 + Vite
- React Router DOM (client-side routing)
- Recharts (data visualization)
- Axios (API communication with JWT interceptors)
- React Hot Toast (notifications)

### Backend
- Python Flask (REST API)
- Flask-JWT-Extended (authentication)
- Flask-SQLAlchemy (ORM)
- Flask-Bcrypt (password hashing)
- Flask-CORS (cross-origin requests)

### Database
- PostgreSQL

### AI / ML
- Meta Prophet (time-series demand + price forecasting)
- scikit-learn KMeans (waste pattern clustering)
- scikit-learn StandardScaler (feature normalization)
- pandas (data processing)

---

## Architecture
cardboardos/

├── frontend/                 # React + Vite

│   └── src/

│       ├── pages/            # 12 page components

│       ├── components/       # Layout, StatCard, etc.

│       └── api/axios.js      # Configured API client

└── backend/                  # Python Flask

├── routes/               # 10 Blueprint route files

├── models/               # SQLAlchemy ORM models

├── ml/                   # Prophet + KMeans scripts

├── app.py                # App factory + config

└── extensions.py         # db, jwt, bcrypt

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
```

Create a PostgreSQL database:
```bash
psql -U postgres -c "CREATE DATABASE cardboardos_db;"
```

Create `.env` in `backend/`:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/cardboardos_db

JWT_SECRET_KEY=cardboardos-secret-key-2024

Seed the database:
```bash
python seed.py
```

Start the server:
```bash
python app.py
```
API runs on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
App runs on `http://localhost:5173`

---

## Key Technical Highlights

**JWT Authentication** — Stateless token-based auth with role support
(admin/manager/operator). Every API route is protected.

**State Machine** — Orders follow a strict status flow
(pending → in_production → dispatched → delivered) enforced at API level.

**Prophet Forecasting** — Two ML models trained on real data:
demand forecasting on 90 days of production history,
price forecasting on 90 days of material prices.

**KMeans Clustering** — Production runs clustered into
Low/Medium/High waste groups with plain-English insights
identifying worst machine+shift combinations.

**2D Bin-Packing** — Box nesting optimizer tries both orientations,
calculates utilization %, and visualizes layout on HTML Canvas.

---

## API Endpoints

| Module | Endpoints |
|---|---|
| Auth | POST /api/auth/register, /login |
| Orders | GET/POST /api/orders/, PATCH /:id/status |
| Production | GET/POST /api/production/, /summary, /weekly |
| Workforce | GET/POST /api/workforce/, /summary |
| Procurement | GET/POST /api/procurement/suppliers, /prices |
| Logistics | GET /api/logistics/summary, /active, /delivered |
| Pricing | POST /api/pricing/quote |
| Waste | GET /api/waste/summary, /trend |
| ESG | GET/POST /api/esg/, /summary |
| AI | GET /api/ai/demand-forecast, /price-forecast, /waste-clustering |
| Box Optimizer | POST /api/boxoptimizer/optimize |

---

## Screenshots

### Dashboard
![Dashboard](Screenshots/Dashboard.png)

### AI Forecast
![AI Forecast](Screenshots/AI_forecast.png)

### Waste ML Insights
![Waste ML](Screenshots/Waste_ML.png)

### Box Optimizer
![Box Optimizer](Screenshots/Box_optimizer.png)

---

## Author
Built by Devashree as my capstone project.