# 🏛️ Smart Civic Complaint Triage System (SC-01)

> **OpenHack'26 Hackathon Project** — Problem Statement **SC-01 (Smart Communities & Public Services)**  
> **One-Line Pitch:** Residents report civic issues in under 60 seconds; the system auto-categorizes, flags duplicates, and prioritizes reports with transparent rules so authorities resolve the most critical issues first.

[![GitHub repo](https://img.shields.io/badge/GitHub-Muhammadumad%2Fcivic--triage-blue?logo=github)](https://github.com/Muhammadumad/civic-triage)
[![Node.js Version](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/Express-5.x-lightgrey?logo=express)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2F%20Mongoose%209-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Logic%20Tests-14%2F14%20Passing-success)](#-testing)

---

## 📑 Project Documentation Index

- **Product Specification**: [`spec.md`](./spec.md) — Problem statement, target users, acceptance criteria, and non-goals.
- **Architecture & Implementation Plan**: [`plan.md`](./plan.md) — Subsystem designs, formula breakdowns, and request flow.
- **Agent Rules & Development Guidelines**: [`AGENTS.md`](./AGENTS.md) — Fixed tech stack, coding standards, and repo rules.
- **Execution Task List**: [`tasks.md`](./tasks.md) / [`docs/TASKS.md`](./docs/TASKS.md) — Phase-by-phase task tracking.

---

## 🚀 What Has Been Built So Far (Phases 1–6 Completed)

### 1. ⚙️ Backend Architecture & Express 5 Server
- **Server Initialization** (`backend/server.js` & `backend/src/app.js`): Configured with Express 5, CORS, Morgan request logging, and static upload delivery (`/uploads`).
- **Database Connection** (`backend/src/config/db.js`): Mongoose 9 setup with automated reconnection handling and fallback warnings.
- **Centralized Error Handling** (`backend/src/middleware/errorHandler.js`): Translates Mongoose validation, CastError (404), duplicate keys, and Multer limits into uniform `{ "error": "message" }` responses.

### 2. 🗄️ Database Schemas & 2dsphere Geospatial Indexing
- **`Complaint`** (`backend/src/models/Complaint.js`):
  - Supported categories: `road_damage`, `garbage`, `streetlight`, `water_leakage`, `blocked_drain`, `other`.
  - Status progression: `new`, `under_review`, `assigned`, `in_progress`, `resolved`, `closed`, `duplicate`, `rejected`.
  - **`2dsphere` Geospatial Index**: Native GeoJSON Point supporting fast radius search and Leaflet bounding-box queries.
  - Automatic title generation, priority band mapping, and vector `embedding` storage.
- **`StatusHistory`** (`backend/src/models/StatusHistory.js`): Immutable audit timeline recording who made status changes, administrative notes, and after-photo evidence.
- **`User`** (`backend/src/models/User.js`): Role-based access (`resident`, `admin`, `field_staff`) with `bcryptjs` password hashing and JWT token generation.
- **`RuleSettings`** (`backend/src/models/RuleSettings.js`): Dynamic priority weights and duplicate detection thresholds.
- **`SensitiveZone`** (`backend/src/models/SensitiveZone.js`): Registered landmarks (`school`, `hospital`, `main road`) with coordinate and radius influence zones.

### 3. 🧠 AI Triage & Algorithmic Engines
- **Offline-Ready AI Classifier** (`backend/src/services/classifier.js`): Weighted domain keyword classifier with word-boundary regex (`\b`) preventing false positives (e.g. `'light'` in `'slightly'`). Returns category, confidence, and transparent reasons.
- **Duplicate Detection & Cosine Similarity** (`backend/src/services/similarity.js`):
  - Token stemming with stopword removal.
  - Feature-hashed vector embeddings.
  - Exact vocabulary cosine similarity calculation ($S_c \ge 0.50$ triggers duplicate linking).
- **Proximity & Distance Engine** (`backend/src/utils/geo.js`): Haversine formula calculating exact physical distance in meters.
- **Transparent Priority Scoring Engine** (`backend/src/services/priority.js`):
  - Calculates dynamic score ($0 \le P \le 100$):
    $$P = W_{\text{cat}} + W_{\text{dup}} + W_{\text{zone}} + W_{\text{age}} + W_{\text{photo}}$$
  - **Category severity** ($W_{\text{cat}}$): Up to 35 points.
  - **Duplicate volume** ($W_{\text{dup}}$): Up to 25 points ($\min(25, \text{duplicateCount} \times 5)$).
  - **Sensitive zone proximity** ($W_{\text{zone}}$): +20 points if within range of school/hospital.
  - **Unresolved report age** ($W_{\text{age}}$): Up to 15 points (+2 per day).
  - **Photo proof** ($W_{\text{photo}}$): +5 points.
  - Priority Bands: **High** ($\ge 70$), **Medium** ($40–69$), **Low** ($< 40$).
- **Unified Pipeline** (`backend/src/services/pipeline.js`): Single entry point `processComplaint()` executing classification, embedding, duplicate linking, and priority scoring before saving.

### 4. 🌐 REST API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/health` | Public | System status, uptime, and MongoDB connection state |
| **`POST`** | `/api/auth/register` | Public | Register new resident or staff user |
| **`POST`** | `/api/auth/login` | Public | Authenticate user and receive JWT |
| **`GET`** | `/api/auth/me` | Authenticated | Retrieve current user profile |
| **`POST`** | `/api/complaints` | Public / Resident | Submit complaint with photo (`photo` field) and location |
| **`GET`** | `/api/complaints` | Public | Public list of complaints |
| **`GET`** | `/api/complaints/mine` | Resident | List logged-in user's complaints |
| **`GET`** | `/api/complaints/nearby` | Public | **Geospatial radius query** (`lat`, `lng`, `radius`) via 2dsphere |
| **`GET`** | `/api/complaints/bounds` | Public | **Map bounding box query** (`minLat`, `minLng`, `maxLat`, `maxLng`) |
| **`GET`** | `/api/complaints/:id` | Public | Complaint details and complete status history timeline |
| **`GET`** | `/api/admin/complaints` | Admin Only | Filtered complaint queue sorted by priority score |
| **`PATCH`**| `/api/admin/complaints/:id/status` | Admin Only | Update status, department, and upload resolution proof (`evidence`) |
| **`POST`** | `/api/admin/complaints/:id/merge` | Admin Only | Confirm or reject duplicate suggestion (recalculates score) |
| **`GET`** | `/api/admin/stats` | Admin Only | System KPIs (total, high priority, resolved, category counts) |
| **`GET`** | `/api/admin/rules` | Admin Only | Read active priority weights and thresholds |
| **`PUT`** | `/api/admin/rules` | Admin Only | Update weights and trigger score recalculation for all open reports |

### 5. 🧪 Logic Test Suite & Demo Data Seeding
- **Offline Logic Tests** (`backend/src/tests/logic.test.js`):
  - 14/14 automated tests covering classifier keywords, vector cosine math, duplicate threshold boundaries, Haversine distances, and multi-factor priority scoring.
- **Seeder Script** (`backend/src/seed/seed.js`):
  - Creates admin (`admin@demo.com` / `admin123`) and resident (`resident@demo.com` / `resident123`).
  - Creates 3 sensitive zones (Hospital, School, Highway).
  - Populates 5 primary complaints across supported categories.
  - Submits a duplicate complaint within 15 meters to demonstrate auto-duplicate linking.
  - Creates a resolved complaint with before/after photos and timeline history.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend Runtime** | Node.js (v20+) |
| **Framework** | Express.js 5 |
| **Database** | MongoDB with Mongoose 9 |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` |
| **File Uploads** | Multer (Max 5 MB, JPG/PNG/WEBP) |
| **Geospatial Indexing** | MongoDB `2dsphere` with GeoJSON |
| **AI / Classification** | Weighted keyword rule classifier + text vector similarity |
| **Frontend (Next Up)** | React + Vite, React Router, Leaflet / React-Leaflet |

---

## 🏃 Getting Started

### 1. Prerequisites
- Node.js (v20+ installed)
- MongoDB running locally on `localhost:27017` (or MongoDB Atlas URI)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Muhammadumad/civic-triage.git
cd civic-triage/backend

# Install dependencies
npm install
```

### 3. Environment Variables
Create or verify `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/civic_complaints_db
JWT_SECRET=supersecretjwtkey_change_in_production
CLIENT_URL=http://localhost:5173
DUP_RADIUS_METERS=150
DUP_SIM_THRESHOLD=0.50
```

### 4. Running the Backend
```bash
# Start in development mode (with nodemon auto-reload)
npm run dev

# Run unit tests (no database required)
npm run test:logic

# Seed demo data (wipes and reloads realistic demo complaints & users)
npm run seed
```

---

## 🗺️ Next Steps Roadmap (Frontend)

- [ ] **Phase 7: Frontend Scaffolding**
  - Setup React + Vite in `frontend/`.
  - Configure `react-router-dom`, `axios` client, and Leaflet styles.
  - Reusable `<MapSelector />` pin dropper component.
- [ ] **Phase 8: Resident Views**
  - Complaint submission form with photo preview and instant AI category chip.
  - Real-time tracking timeline view (`/track/:id`) with proof photo.
- [ ] **Phase 9: Admin Dashboard**
  - Priority-ranked complaint queue table.
  - Interactive Leaflet cluster map with priority color codes (Red=High, Yellow=Medium, Green=Low).
  - Quick action status updater & duplicate merge/reject panel.
- [ ] **Phase 10: End-to-End Demo Polish**
  - Complete demo rehearsal: Resident submit -> AI triage -> Duplicate flag -> Priority ranking -> Admin resolution.
