# 🏛️ Smart Civic Complaint Triage System (SC-01)

> **OpenHack'26 Hackathon Project** — Problem Statement **SC-01 (Smart Communities & Public Services)**  
> **One-Line Pitch:** Residents report civic issues in under 60 seconds; the system auto-categorizes, flags duplicates, and prioritizes reports with transparent rules so authorities resolve the most critical issues first.

[![GitHub repo](https://img.shields.io/badge/GitHub-Muhammadumad%2Fcivic--triage-blue?logo=github)](https://github.com/Muhammadumad/civic-triage)
[![Node.js Version](https://img.shields.io/badge/Node.js-20%2B-green?logo=node.js)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/Express-5.x-lightgrey?logo=express)](https://expressjs.com/)
[![Next.js Version](https://img.shields.io/badge/Next.js-16%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas%20%2F%20Mongoose%209-brightgreen?logo=mongodb)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Logic%20Tests-14%2F14%20Passing-success)](#-testing)

---

## 📑 Project Documentation Index

- **Product Specification**: [`spec.md`](./spec.md) — Problem statement, target users, acceptance criteria, and non-goals.
- **Architecture & Implementation Plan**: [`plan.md`](./plan.md) — Subsystem designs, formula breakdowns, and request flow.
- **Agent Rules & Development Guidelines**: [`AGENTS.md`](./AGENTS.md) — Fixed tech stack, coding standards, and repo rules.
- **Execution Task List**: [`docs/TASKS.md`](./docs/TASKS.md) — Phase-by-phase task tracking (Phases 1–10 Complete).

---

## 📊 Comprehensive Progress Report (All 10 Phases Completed)

```
[Phase 1: Database & Init]      ──▶ COMPLETED (Express 5, Mongoose 9, 2dsphere Geo)
[Phase 2: Core API & Uploads]   ──▶ COMPLETED (Multer, Auth JWT, Complaints CRUD)
[Phase 3: AI Classification]    ──▶ COMPLETED (Rule & Keyword Classifier, Embeddings)
[Phase 4: Duplicate Detection]  ──▶ COMPLETED (Cosine Similarity + 150m Proximity)
[Phase 5: Priority Engine]      ──▶ COMPLETED (Transparent 0-100 Formula, Sensitive Zones)
[Phase 6: Admin REST APIs]      ──▶ COMPLETED (Queue, Status, Evidence, Rule Engine)
[Phase 7: Frontend Scaffolding] ──▶ COMPLETED (Next.js 16 App Router, Stitch Design)
[Phase 8: Resident Portal]      ──▶ COMPLETED (Report Form, GPS Selector, Real-time Timeline)
[Phase 9: Admin Command Center] ──▶ COMPLETED (Queue Filter, Cluster Map, Action Modal)
[Phase 10: E2E Integration]     ──▶ COMPLETED (Atlas DB, Store Sync, Seeder, 27 Routes Built)
```

---

## 🏗️ System Architecture & What Has Been Built

### 1. ⚙️ Backend Architecture (`backend/`)
- **Express 5 Server (`server.js`, `src/app.js`)**: Runs on `http://localhost:5000`. Configured with CORS, Morgan logging, and static upload delivery (`/uploads`).
- **Database Connection (`src/config/db.js`)**: MongoDB connection using Mongoose 9 with MongoDB Atlas cloud support and fallback handling.
- **Geospatial Indexing (`src/models/Complaint.js`, `src/models/SensitiveZone.js`)**:
  - Native `2dsphere` index on GeoJSON Point coordinates `[longitude, latitude]`.
  - Mongoose 9-compatible async pre-save hooks ensuring valid coordinate transformations.
- **Centralized Error Handling (`src/middleware/errorHandler.js`)**: Clean error formatting `{ "error": "message" }` across CastError (404), validation failures (400), and duplicate conflicts (409).

### 2. 🧠 AI Triage & Algorithmic Engines (`backend/src/services/`)
- **Offline-Ready AI Classifier (`classifier.js`)**:
  - Deterministic regex word-boundary keyword scoring.
  - Enforced categories: `road_damage`, `garbage`, `streetlight`, `water_leakage`, `blocked_drain`, `other`.
  - Produces suggested category, confidence (0.0 to 1.0), and human-readable explanation.
- **Duplicate Detection Engine (`similarity.js`, `src/utils/geo.js`)**:
  - Token stemming and feature-hashed text embeddings.
  - Exact Cosine Similarity ($S_c \ge 0.50$).
  - Spatial radius clustering ($R \le 150\text{m}$) using Haversine distance calculations.
  - Automatically links duplicates to parent complaints and increments `duplicateCount`.
- **Transparent Priority Scoring Engine (`priority.js`)**:
  - Formula:
    $$P = W_{\text{cat}} + W_{\text{dup}} + W_{\text{zone}} + W_{\text{age}} + W_{\text{photo}}$$
  - **Category Weight ($W_{\text{cat}}$)**: Up to 35 pts based on civic urgency.
  - **Duplicate Volume ($W_{\text{dup}}$)**: Up to 25 pts ($\min(25, \text{duplicateCount} \times 5)$).
  - **Sensitive Zone Proximity ($W_{\text{zone}}$)**: +20 pts if within 150m of a school, hospital, or main road.
  - **Unresolved Age ($W_{\text{age}}$)**: +2 pts per open day (up to 15 pts).
  - **Verified Photo Proof ($W_{\text{photo}}$)**: +5 pts.
  - **Priority Bands**: **High** ($\ge 70$), **Medium** ($40–69$), **Low** ($< 40$).
- **Unified Pipeline (`pipeline.js`)**: Single pipeline executing classification, deduplication, and priority scoring before saving.

### 3. 🖥️ Frontend Web Application (`frontend/`)
- **Framework**: Next.js 16 App Router with React 19, TypeScript, and Tailwind CSS.
- **27 Fully Compiled Routes**: Clean production build with 0 ESLint errors and 0 type errors.
- **API & Store Bridge (`frontend/src/lib/api.ts`, `frontend/src/lib/complaints-store.ts`)**:
  - Axios client connecting to `http://localhost:5000/api`.
  - Seamless bidirectional mapping of categories, statuses, and coordinates between backend and frontend.
  - Optimistic local-first caching for instantaneous navigation and background MongoDB synchronization.
- **Resident Portal**:
  - **Complaint Submission (`/complaints/new`)**: Instant image preview, speech-to-text dictation shortcut, map GPS pin picker, anonymous submission toggle, and multipart upload.
  - **Public / Resident Tracking (`/complaints/[id]`)**: Real-time status timeline, assigned department, AI triage audit log, and before-and-after photo evidence comparison.
- **Municipal Admin Dashboard**:
  - **Queue Table (`/admin`)**: Filter by status, department, ward, and priority score with quick triage actions.
  - **Interactive GIS Map (`/admin/map`)**: Full-screen Leaflet map displaying categorized pins, sensitive zones, and cluster radius.
  - **Dynamic Rules Configurator (`/admin/rules`)**: Live sliders to tune weights ($W_{\text{cat}}$, $W_{\text{dup}}$, $W_{\text{zone}}$, etc.) with backend recalculation across all open complaints.

---

## 🌐 Complete REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/health` | Public | System health, uptime, and database status |
| **`POST`** | `/api/auth/register` | Public | Register resident or staff account |
| **`POST`** | `/api/auth/login` | Public | Login with email & password, returns JWT |
| **`GET`** | `/api/auth/me` | Authenticated | Fetch current profile |
| **`POST`** | `/api/complaints` | Public / Resident | Submit new report with `photo` & GPS coordinates |
| **`GET`** | `/api/complaints` | Public | List all complaints (with status/category filters) |
| **`GET`** | `/api/complaints/mine` | Resident | List complaints submitted by logged-in user |
| **`GET`** | `/api/complaints/nearby`| Public | 2dsphere radius search (`lat`, `lng`, `radius`) |
| **`GET`** | `/api/complaints/bounds`| Public | Map bounding box query (`minLat`, `minLng`, `maxLat`, `maxLng`) |
| **`GET`** | `/api/complaints/:id` | Public | Complaint detail with full `StatusHistory` timeline |
| **`GET`** | `/api/admin/complaints` | Admin Only | Priority-sorted triage queue with pagination |
| **`PATCH`**| `/api/admin/complaints/:id/status` | Admin Only | Transition status, assign department, attach `evidence` photo |
| **`POST`** | `/api/admin/complaints/:id/merge` | Admin Only | Confirm or break duplicate link (recalculates priority) |
| **`GET`** | `/api/admin/stats` | Admin Only | High-level metrics: total, unresolved, high-priority, SLA |
| **`GET`** | `/api/admin/rules` | Admin Only | Retrieve active priority calculation weights |
| **`PUT`** | `/api/admin/rules` | Admin Only | Save modified weights & recalculate open queue scores |

---

## 👥 Demo Logins & Seed Data

Once seeded (`npm run seed`), you can test the system with these pre-configured accounts:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@demo.com` | `admin123` | Full Admin Dashboard, Triage Queue, Map, Rules Configurator |
| **Resident** | `resident@demo.com` | `resident123` | Submit Reports, Track Personal Timeline, Citizen Portal |

**Pre-loaded Demo Datasets:**
- 3 registered **Sensitive Zones**: Metro Hospital, Central Public School, Ring Road Express Corridor.
- 5 categorized primary complaints spanning potholes, overflowing trash, streetlights, and water leakage.
- 1 physical **duplicate report** demonstrating automated 15-meter clustering and duplicate linking.
- 1 **resolved report** with complete before/after photographic proof and audit timeline.

---

## 🚀 How to Run the Entire System

### Prerequisites
- Node.js 20+ installed
- MongoDB Atlas cluster or local MongoDB instance

### 1. Terminal 1: Start the Backend API
```powershell
cd "c:\Users\Muhammad Umad\SC-1 Project\backend"
npm run dev
```
> Server runs on **`http://localhost:5000`** with Node's native file watcher.

### 2. Terminal 2: Seed the Demo Database
```powershell
cd "c:\Users\Muhammad Umad\SC-1 Project\backend"
npm run seed
```
> Connects to MongoDB, clears stale data, and loads realistic complaints, zones, rules, and demo accounts.

### 3. Terminal 3: Start the Next.js Frontend
```powershell
cd "c:\Users\Muhammad Umad\SC-1 Project\frontend"
npm run dev
```
> App runs on **`http://localhost:3000`**.

### 4. Running Algorithmic & Logic Unit Tests
```powershell
cd "c:\Users\Muhammad Umad\SC-1 Project\backend"
npm run test:logic
```
> Runs 14 comprehensive, zero-dependency unit tests verifying classifier boundaries, similarity mathematics, Haversine spatial calculations, and priority scoring.

---

## 📁 Repository Map

```
c:\Users\Muhammad Umad\SC-1 Project\
├── backend/
│   ├── server.js                      # HTTP entry point (port 5000)
│   ├── src/
│   │   ├── app.js                     # Express app setup, CORS, static routes
│   │   ├── config/db.js               # MongoDB connection manager
│   │   ├── models/                    # Complaint, User, StatusHistory, RuleSettings, SensitiveZone
│   │   ├── routes/                    # auth.js, complaints.js, admin.js
│   │   ├── services/                  # classifier.js, similarity.js, priority.js, pipeline.js
│   │   ├── middleware/                # auth.js, upload.js, errorHandler.js
│   │   ├── utils/geo.js               # Haversine distance & spatial helpers
│   │   ├── seed/seed.js               # Demo dataset loader
│   │   └── tests/logic.test.js        # 14 unit tests for AI, math, and rules
│   └── uploads/                       # User-submitted and resolution evidence photos
├── frontend/
│   ├── src/
│   │   ├── app/                       # 27 Next.js App Router routes (Resident & Admin)
│   │   ├── components/                # Leaflet maps, forms, modals, tables, badges
│   │   ├── context/                   # PersonaContext, ThemeContext
│   │   └── lib/                       # api.ts (REST bridge), complaints-store.ts (optimistic store)
├── docs/                              # ARCHITECTURE.md, DATA_MODEL.md, API_CONTRACT.md, TASKS.md
├── spec.md                            # Product specification
├── plan.md                            # Engineering & mathematical plan
├── AGENTS.md                          # Repository rules & architecture guidelines
└── README.md                          # Full system documentation & progress report
```
