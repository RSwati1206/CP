# BizConnect — Local Business Promotion and Market Analytics Portal

[![Platform](https://img.shields.io/badge/Platform-BizConnect-blue)]()
[![Pilot Cluster](https://img.shields.io/badge/Pilot%20Cluster-Bengaluru%20(RR%20Nagar%20%26%20RNSIT)-orange)]()
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Flask%20%7C%20PostgreSQL%20%7C%20Python%20ML-emerald)]()

**BizConnect** is a full-stack web application designed to connect local neighborhood businesses with nearby customers through transparent market intelligence, active deal management, and real-time community discovery.

---

## 🏛️ System Architecture & Methodology

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

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite) + Tailwind CSS** | Fast, responsive single-page application with modern component architecture |
| **Backend API** | **Python Flask** | RESTful modular API with role-based JWT authentication and CORS |
| **Database** | **PostgreSQL (with SQLite fallback)** | Relational database (`schema.sql` included); automatic zero-config SQLite fallback |
| **Analytics & ML** | **Python (Scikit-Learn + NumPy)** | TF-IDF + Naive Bayes text sentiment classifier, Haversine spatial calculations, demand aggregation |
| **Visualisation** | **Chart.js + Leaflet** | Interactive OpenStreetMap tiles with custom SVG pins and Chart.js line, bar, doughnut, and radar charts |

---

## 🔑 Pre-Seeded Demo Accounts

The database comes fully seeded with **20 realistic Bengaluru local businesses** (clustered around RNSIT, RR Nagar, Kengeri, and Banashankari), **dozens of active offers/events**, **sentiment-analyzed reviews**, and **over 800 timestamped search and view events**.

| Role | Email | Password | What You Can Explore |
| :--- | :--- | :--- | :--- |
| **Business Owner** | `rswati1206@gmail.com` | `Password123!` | Manages *"The Bengaluru Bistro & Rooftop Cafe"*; full Chart.js analytics, review sentiment donut, demand insights, competitor radar, deal manager, and interactive map pin picker. |
| **Customer** | `rswati1206@gmail.com` | `Password123!` | Personalized recommendations, interactive Leaflet map synchronized with business list, floating deals of the day, review submission with real-time sentiment analysis, and social sharing. |
| **Administrator** | `admin@demo.com` | `Password123!` | System-wide KPI metrics, user management (activate/deactivate), merchant approval & suspension, and review moderation (hide/delete). |

> 💡 **Quick Demo Access:** The Login screen features 1-click quick fill buttons for Owner, Customer, and Administrator so you can test every dashboard in seconds without typing.

---

## 🌟 Key Features & Enhancements

### 1. 🎨 BizConnect Modern Branding & SVG Logo
- Custom interlinked storefront and connection-node vector logo (`BizConnectLogo.jsx`) representing commerce bridged with community.
- Scalable SVG icon used across the header, navigation, authentication screens, and browser favicon (`/favicon.svg`).
- Unified blue, indigo, and warm golden amber accent palette.

### 2. 🌓 Persistent Dark & Light Theme with WCAG AA Contrast
- Global theme toggle in the navigation bar switching seamlessly between dark and light modes.
- Persists user selection in `localStorage` and falls back to operating system `prefers-color-scheme`.
- **WCAG AA Compliance:** Every heading, label, input, button, and card has verified 4.5:1+ contrast against dark backgrounds.
- **Leaflet Map Popups in Dark Mode:** High-contrast category badges, pure white headings, sky-blue distances, and prominent action buttons on rich deep slate surfaces.

### 3. 🎁 Floating Deals of the Day
- Floating deal capsules drifting across the screen in diagonal, varied paths (`FloatingDeals.jsx`).
- Smooth, slow CSS animation that pauses on hover (`hover:[animation-play-state:paused]`).
- Non-blocking layout (`pointer-events-none` container with `pointer-events-auto` on deal cards).
- Full accessibility support: automatically stops or hides when `prefers-reduced-motion` is enabled.

### 4. 🌊 Purposeful Viewport Scroll Animations
- Sections and cards gracefully fade and slide into view on scroll (`ScrollReveal.jsx`).
- Staggered entrance for recommendation grids.
- Native hardware-accelerated transforms and opacity with zero layout jank.
- Instantly visible with no animation when `prefers-reduced-motion` is set.

### 5. 🏷️ Reusable `DealBadge` Component
- High-visibility promotional badges with `shimmer-badge` and gentle `animate-pulse-glow`.
- Visual states for active deals, expiring offers, events, and coupon codes.

### 6. 🌿 Refined Emerald-to-Teal Customer Dashboard Banner
- Aesthetic deep teal-to-emerald gradient (`from-teal-900 via-emerald-800 to-teal-950`) replacing plain blue.
- Crystal-clear white text with ambient glass/mesh lighting.

### 7. 🏪 Updated Hyperlocal Store Catalogue
- 20 realistic local businesses clustered in Bengaluru around RR Nagar and RNSIT.
- New artisanal cafes and specialty coffee houses: *Brew & Bean Artisan Coffee House*, *Udupi Vaibhav Heritage Tiffin Room*, *The Coastal Bay Seafood & Grill*.
- New organic grocery and supermarkets: *Nandi Organics & Farm Fresh Market*, *DailyBasket Superstore & Gourmet Hub*, *GreenLeaf Agro & Dairy Mart*.
- **All pharmacy and medical stores removed** from data, category filters, and recommendation engines.

### 8. 🛡️ Role-Based Authentication & Accessible Password Toggle
- Forms default to `rswati1206@gmail.com`.
- Accessible show/hide password toggle (eye icon) with keyboard support and ARIA labels.
- Composite unique key `(email, role)` allowing seamless multi-role testing.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Start Backend API
```bash
# Windows batch shortcut
start_backend.bat

# Or manual execution:
python backend/app.py
```
Backend runs at `http://localhost:5000` (auto-creates and seeds SQLite database `local_promo_v2.db`).

### 3. Start Frontend
```bash
# Windows batch shortcut
start_frontend.bat

# Or manual execution:
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.
