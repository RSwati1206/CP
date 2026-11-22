# Local Business Promotion and Market Analytics Portal

[![Academic Project](https://img.shields.io/badge/Project-Community%20Project%20Synopsis-blue)](PPT.pdf)
[![Institution](https://img.shields.io/badge/Institution-RNSIT%20Bengaluru-orange)](https://www.rnsit.ac.in)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Flask%20%7C%20PostgreSQL%20%7C%20Python%20ML-emerald)]()

A full-stack web application designed to empower neighborhood small businesses and MSMEs with affordable digital discovery, promotional deal management, and data-driven market intelligence, while offering local consumers location-based discovery, synchronized interactive maps, and personalized recommendations.

Developed strictly in accordance with the project synopsis screening architecture for **RNS Institute of Technology (RNSIT)**, Department of Computer Science & Engineering.

---

## 👥 Academic Credits & Project Details

- **Project Title:** Local Business Promotion and Market Analytics Portal
- **Institution:** RNS Institute of Technology (RNSIT), Bengaluru
- **Department:** Department of Computer Science & Engineering
- **Guide:** Dr. Prakash S, Associate Professor, Dept. of CSE, RNSIT
- **Student Team:**
  - **R. Swati** `[1IB25CS165]`
  - **Priya Javalagi** `[1IB25CS160]`
  - **Roshni** `[1IB25CS178]`
  - **Piyush Bhati** `[1RN26CS840-T]`

---

## 🏛️ System Architecture & Methodology

As defined in the project methodology (Slide 8 of `PPT.pdf`):

```
┌────────────────────────────────┐       ┌────────────────────────────────┐
│      Users & Data Sources      │       │           Data Layer           │
│ • Business Owners (Shopkeepers)│       │ • Schema Validation & Cleaning │
│ • Customers (Ratings & Reviews)│ ───►  │ • PostgreSQL Relational Store  │
│ • Public Geospatial & Maps     │       │ • Search & View Event Logging  │
└────────────────────────────────┘       └────────────────────────────────┘
                                                         │
                                                         ▼
┌────────────────────────────────┐       ┌────────────────────────────────┐
│         Portal Outputs         │       │        Analytics Engine        │
│ • Business Owner Analytics     │       │ • Scikit-Learn Sentiment NLP   │
│ • Synchronized Customer Map    │ ◄───  │ • Time-of-Day Demand Heatmaps  │
│ • Offer & Promotion Manager    │       │ • Competitor Benchmark Radar   │
│ • Administrator Control Center │       │ • Multi-Factor Recommender     │
└────────────────────────────────┘       └────────────────────────────────┘
```

---

## 🛠️ Proposed Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite) + Tailwind CSS** | Fast, responsive single-page application with modern component architecture |
| **Backend API** | **Python Flask** | RESTful modular API with role-based JWT authentication and CORS |
| **Database** | **PostgreSQL (with SQLite fallback)** | Relational database (`schema.sql` included); automatic zero-config SQLite fallback |
| **Analytics & ML** | **Python (Scikit-Learn + NumPy)** | TF-IDF + Naive Bayes text sentiment classifier, Haversine spatial calculations, demand aggregation |
| **Visualisation** | **Chart.js + Leaflet** | Interactive OpenStreetMap tiles with custom pins and Chart.js line, bar, doughnut, and radar charts |

---

## 🔑 Pre-Seeded Demo Accounts

The database comes fully seeded with **16 realistic Bengaluru local businesses** (clustered around RNSIT, RR Nagar, Kengeri, and Banashankari), **dozens of active offers/events**, **sentiment-analyzed reviews**, and **over 800 timestamped search and view events**.

| Role | Email | Password | What You Can Explore |
| :--- | :--- | :--- | :--- |
| **Business Owner** | `owner@demo.com` | `Password123!` | Manages *"The Bengaluru Bistro & Rooftop Cafe"*; full Chart.js analytics, review sentiment donut, demand insights, competitor radar, deal manager, and interactive map pin picker. |
| **Customer** | `customer@demo.com` | `Password123!` | Personalized recommendations, interactive Leaflet map synchronized with business list, deal redemption, review submission with real-time sentiment analysis, and social sharing. |
| **Administrator** | `admin@demo.com` | `Password123!` | System-wide KPI metrics, user management (activate/deactivate), merchant approval & suspension, and review moderation (hide/delete). |

> 💡 **Quick Demo Access:** The Login screen features 1-click quick fill buttons for Owner, Customer, and Administrator so you can test every dashboard in seconds without typing.

---

## 🌟 Key Features

### 1. 🛡️ Role-Based Authentication & Route Guarding
- Secure registration for `customer` and `business_owner` roles with password hashing via `werkzeug.security`.
- Strict JWT authentication token decoding with role enforcement (`@role_required`).
- Automatic role-based landing redirection after login (`/dashboard/owner`, `/dashboard/customer`, `/admin`).

### 2. 🗺️ Customer Hub & Synchronized Map Search
- **Interactive Leaflet Map:** OpenStreetMap tile layer with custom color-coded pins per category (Restaurants, Supermarkets, Salons, Gyms, Electronics, Healthcare, etc.).
- **Real-Time Map & List Sync:** Clicking a pin highlights and auto-scrolls to the store card in the list; clicking a card centers the map and triggers the pin popup.
- **Search & Radius Filtering:** Filter by keyword, category chips, distance radius (3 km, 5 km, 10 km, 15 km, All Bengaluru), or sort by nearest / top rated.
- **Personalized Recommendations Engine:** Transparent rule-based/similarity scoring that combines customer category affinity (past searches, views, and ratings) with proximity and active promotions, clearly displaying *why* each place was recommended (e.g., *"Matches your interest in Italian Cuisine"*, *"Special deal just 0.5km away"*).
- **Social Sharing:** Instant WhatsApp sharing intent and one-click shareable link copy for business and review pages.
- **Interactive Review Submission:** Rate 1 to 5 stars, submit feedback, and view instantaneous NLP sentiment classification.

### 3. 📊 Business Owner Intelligence Dashboard
- **Core KPIs:** Store views, regional search appearances, average star rating, active promotions, and customer sentiment health percentage.
- **Views & Search Impressions Over Time:** Chart.js Line chart tracking daily discovery over 14 days.
- **Ratings Distribution:** Chart.js Bar chart showing distribution across 1 to 5 star ratings.
- **NLP Sentiment Intelligence:**
  - Positive vs. Negative review breakdown via Chart.js Doughnut.
  - Sentiment trend progression line over time.
  - Highlighting key positive and negative sentiment keywords extracted from customer feedback.
- **Trend & Demand Insights:**
  - Time-of-day demand distribution (Morning, Afternoon, Evening, Night) derived from stored logs.
  - Day-of-week traffic patterns (Monday through Sunday) revealing weekend vs. weekday rushes.
  - Top searched categories across the Bengaluru cluster.
- **Competitor Comparison Benchmark:**
  - Multi-metric Chart.js Radar chart benchmarking the business against nearby rivals in the same category on Rating, Review Count, Sentiment %, Active Offers, and Views.
  - Comparison table displaying nearby competitors with live metrics.
- **Offer & Promotion Manager:**
  - Create, schedule, edit, expire, and delete promotional vouchers, discounts, and local events (with promo codes, start/end dates, and click tracking).
- **Business Profile & Interactive Map Pin Picker:**
  - Edit store name, hours, contact, description, photos, and tags.
  - Click or drag anywhere on an interactive Leaflet map to update exact storefront coordinates.

### 4. ⚙️ Administrator Control Center
- Platform overview KPIs: Total users, active merchants, total reviews, offers, searches, and views.
- Business approval & suspension management.
- User account deactivation / reactivation.
- Review moderation: filter positive/negative reviews, hide flagged feedback, or permanently delete inappropriate reviews.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (tested on Python 3.11 & 3.14)
- **Node.js 18+** & **npm**

### Option A: Run Locally (Zero-Config with SQLite Fallback)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RSwati1206/CP.git
   cd CP
   ```

2. **Set up and start the Backend API:**
   ```bash
   # Install Python requirements
   pip install -r backend/requirements.txt

   # Seed database with 16 Bengaluru businesses and analytics logs
   python backend/seed_data.py

   # Start Flask server (runs on http://localhost:5000)
   python backend/app.py
   ```

3. **Set up and start the Frontend (React + Vite):**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```
   Open your browser at **`http://localhost:5173`**.

---

### Option B: Run with PostgreSQL Database

1. Ensure PostgreSQL is running locally or via Docker:
   ```bash
   createdb local_promo_db
   psql -d local_promo_db -f backend/schema.sql
   ```
2. Configure the database connection string:
   ```bash
   export DATABASE_URL="postgresql+psycopg2://postgres:password@localhost:5432/local_promo_db"
   ```
   *(On Windows PowerShell: `$env:DATABASE_URL="postgresql+psycopg2://postgres:password@localhost:5432/local_promo_db"`)*

3. Seed and start the backend:
   ```bash
   python backend/seed_data.py
   python backend/app.py
   ```

---

### Option C: Run with Docker Compose

To spin up PostgreSQL, the Flask backend, and the React frontend in isolated containers:
```bash
docker compose up --build
```
The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000/api/health`.

---

## 📁 Repository Directory Structure

```
CP/
├── PPT.pdf                      # Authoritative Academic Synopsis Document
├── README.md                    # Comprehensive Project Documentation
├── docker-compose.yml           # Multi-container orchestration (Postgres, API, UI)
├── .env.example                 # Environment variables specification
├── start_backend.bat            # Windows 1-click backend runner
├── start_frontend.bat           # Windows 1-click frontend runner
│
├── backend/
│   ├── app.py                   # Flask Application Factory & Blueprints
│   ├── config.py                # Environment & Database Configuration
│   ├── database.py              # SQLAlchemy Engine & Session
│   ├── requirements.txt         # Python Dependencies
│   ├── schema.sql               # Pure PostgreSQL Schema DDL
│   ├── seed_data.py             # Realistic Bengaluru Seed Script
│   ├── Dockerfile               # Backend Container specification
│   ├── models/                  # SQLAlchemy Relational Models
│   │   ├── user.py              # Users (roles: customer, business_owner, admin)
│   │   ├── business.py          # Business Profiles & Coordinates
│   │   ├── offer.py             # Deals, Promotions & Events
│   │   ├── review.py            # Customer Reviews with Sentiment Flags
│   │   └── analytics_log.py     # SearchLog, ViewLog & OfferClick models
│   ├── auth/                    # Security & Authentication
│   │   ├── routes.py            # /register, /login, /me
│   │   └── utils.py             # JWT generation, token_required, role_required
│   ├── ml/                      # Data Science & Machine Learning
│   │   ├── sentiment_analyzer.py# Scikit-Learn TF-IDF + Naive Bayes Classifier
│   │   ├── recommender.py       # Haversine + User Affinity Recommender
│   │   └── demand_analytics.py  # Time-of-day demand & Competitor Radar
│   └── api/                     # RESTful API Endpoints
│       ├── businesses.py        # Location search, category filtering, detail
│       ├── offers.py            # Deals & events CRUD
│       ├── reviews.py           # Customer review submission & sentiment
│       ├── recommendations.py   # Shop & offer recommendation feed
│       ├── owner_analytics.py   # Chart.js metrics for merchants
│       └── admin.py             # Platform moderation & management
│
└── frontend/
    ├── package.json             # React, Chart.js, Leaflet, Tailwind dependencies
    ├── vite.config.js           # Vite build configuration
    ├── tailwind.config.js       # Tailwind CSS design system
    ├── Dockerfile               # Production multi-stage Docker build
    ├── nginx.conf               # Reverse proxy & static hosting config
    └── src/
        ├── App.jsx              # Role-based Client Routing
        ├── main.jsx             # React DOM root
        ├── index.css            # Tailwind & Leaflet styles
        ├── context/
        │   └── AuthContext.jsx  # Authentication state & persistent session
        ├── services/
        │   └── api.js           # Centralized API fetch client
        ├── components/
        │   ├── Navbar.jsx       # Responsive header with role badges
        │   ├── Footer.jsx       # RNSIT Project synopsis credits
        │   ├── LeafletMap.jsx   # Synchronized Leaflet map & coordinate picker
        │   └── ProtectedRoute.jsx # Role authorization wrapper
        └── pages/
            ├── Login.jsx        # Login screen with 1-click demo buttons
            ├── Register.jsx     # Role-based customer/owner signup
            ├── CustomerDashboard.jsx # Map search, sync list, recommendations
            ├── BusinessDetail.jsx # Store info, deals, reviews & share
            ├── OwnerDashboard.jsx # Chart.js analytics, sentiment, demand, radar
            └── AdminDashboard.jsx # System control, moderation & user table
```

---

## 🎯 Verification and Quality Checklist

- [x] **Role-Based Authentication:** Protected endpoints and route guards for `customer`, `business_owner`, and `admin`.
- [x] **Customer Dashboard:** Synchronized Leaflet map and list view with category and radius filtering.
- [x] **Personalized Recommendations:** Rule and affinity-based recommendations with transparent explanations.
- [x] **Review Sentiment NLP:** Scikit-Learn TF-IDF + Naive Bayes classifier categorizing customer reviews as positive or negative.
- [x] **Owner Analytics:** Chart.js line charts (views/searches), bar charts (ratings distribution & demand by hour/day), donut chart (sentiment), and radar chart (competitor comparison).
- [x] **Offer & Promotion Manager:** Deal scheduling, active toggle, validity dates, and discount codes.
- [x] **Store Profile Map Pin Picker:** Click/drag pin on Leaflet map to adjust store coordinates.
- [x] **Admin Panel:** User status toggles, merchant approval/suspension, and review moderation.
- [x] **Realistic Seed Data:** 16 businesses clustered in Bengaluru with realistic reviews, active offers, and 800+ search/view log events.
- [x] **Database Flexibility:** Native PostgreSQL DDL (`schema.sql`) and instant zero-config SQLite fallback.
- [x] **Production Ready:** Verified frontend build and backend test pass without placeholders.
