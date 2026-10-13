# 📝 Execution Plan & Task List (docs/TASKS.md)

**Context:** Smart Civic Complaint Triage System (SC-01)  
**Goal:** Build the system in atomic, testable, dependency-aware steps.  
**Instructions for AI Agent:** Do not skip steps. Complete one phase entirely and verify it works before moving to the next. Do not generate large chunks of unrelated UI and Backend code at the same time.

---

## Phase 1: Project Initialization & Database Foundation
**Goal:** Scaffold the backend and ensure database connectivity.

- [x] **Task 1.1: Initialize Node Project**
  - Create project directory `backend/`.
  - Core dependencies: `express`, `mongoose`, `cors`, `dotenv`, `morgan`, `multer`, `bcryptjs`, `jsonwebtoken`.
  - Setup `server.js` with Express and a `/api/health` test route.
  - *Status:* Completed & verified.

- [x] **Task 1.2: Database Connection**
  - Setup MongoDB connection in `config/db.js` using `mongoose`.
  - Load connection string from `.env`.
  - *Status:* Completed & verified.

- [x] **Task 1.3: Define Mongoose Models (Core)**
  - Create `models/Complaint.js` matching schema in `plan.md` & `spec.md` with geospatial 2dsphere index.
  - Create `models/User.js` (`name`, `email`, `passwordHash`, `role`).
  - Create `models/StatusHistory.js`.
  - Create `models/RuleSettings.js` and `models/SensitiveZone.js`.
  - *Status:* Completed & verified.

---

## Phase 2: Core API & File Uploads
**Goal:** Allow residents to submit basic complaints with photos.

- [x] **Task 2.1: Setup Multer for Image Uploads & Sample Assets**
  - Installed `multer`. Created `middleware/upload.js` (5 MB max, jpg/png/webp, fields `photo` and `evidence`).
  - Statically serve `/uploads` via Express with automatic fallback handling to prevent 404s for missing demo files.
  - Added `backend/src/seed/downloadSampleImages.js` to ensure seeded complaint photos (`sample_pothole_1.jpg`, `sample_drain_1.jpg`, `sample_streetlight_1.jpg`, etc.) are pre-cached in `backend/uploads`.
  - *Status:* Completed.

- [x] **Task 2.2: Basic Complaint Submission Endpoint**
  - Created `POST /api/complaints` route accepting multipart form data.
  - Saves to DB, sets status, calculates priority, and logs status history.
  - *Status:* Completed.

- [x] **Task 2.3: Authentication, Authorization & Security Hardening**
  - Enhanced `POST /api/auth/login` and `POST /api/auth/register` with strict email regex, password strength checks, and role escalation prevention (public signup restricted to `'resident'`).
  - Implemented sliding-window rate limiting middleware `middleware/rateLimiter.js` against brute-force attacks.
  - Added authenticated password management `PUT /api/auth/password` and profile check `GET /api/auth/me`.
  - Built frontend Sign In (`/login`) and Sign Up (`/register`) forms with instant demo quick-login shortcuts, JWT persistence, and Navbar session states.
  - *Status:* Completed & verified.

---

## Phase 3: AI Pipeline Integration
**Goal:** Auto-categorize and embed complaint descriptions.

- [x] **Task 3.1: LLM Classification Service**
  - Created `services/classifier.js` with weighted keyword scoring and fallback reasoning.
  - Enforced categories: `road_damage`, `garbage`, `streetlight`, `water_leakage`, `blocked_drain`, `other`.
  - *Status:* Completed & verified.

- [x] **Task 3.2: Text Embedding Service**
  - Added `generateEmbedding(text)` in `services/similarity.js` with feature hashing.
  - *Status:* Completed & verified.

- [x] **Task 3.3: Wire AI into Submission Flow**
  - Created `services/pipeline.js` with `processComplaint()`.
  - Automatically saves `aiCategory`, `aiConfidence`, `aiReason`, and `embedding`.
  - *Status:* Completed & verified.

---

## Phase 4: Duplicate Detection Engine
**Goal:** Prevent duplicate reports using spatial queries and vector similarity.

- [x] **Task 4.1: Cosine Similarity Utility**
  - Created `calculateCosineSimilarity()` and `calculateTextSimilarity()` in `services/similarity.js`.
  - Passed unit tests for identical, orthogonal, and civic complaints.
  - *Status:* Completed & verified.

- [x] **Task 4.2: Proximity Query Logic**
  - Created geospatial distance check with Haversine formula in `utils/geo.js`.
  - Spatial radius search within 150m for same category in `services/pipeline.js`.
  - *Status:* Completed & verified.

- [x] **Task 4.3: Integrate Duplicate Logic**
  - Auto-flags duplicates if similarity >= 0.50, links `duplicateOf`, and increments original's `duplicateCount`.
  - *Status:* Completed & verified.

---

## Phase 5: Priority Scoring Engine
**Goal:** Calculate urgency dynamically based on configurable rules.

- [x] **Task 5.1: Priority Calculation Service**
  - Created `services/priority.js` with formula: $W_{cat} + W_{dup} + W_{zone} + W_{age} + W_{photo}$.
  - Checks proximity to registered `SensitiveZone`s (schools, hospitals, main roads).
  - *Status:* Completed & verified.

- [x] **Task 5.2: Apply Priority on Creation & Updates**
  - Wired into `processComplaint()` and `RuleSettings`.
  - Automatically generates `priorityScore` (0-100), `priorityBand`, and `priorityReasons`.
  - *Status:* Completed & verified.

---

## Phase 6: Admin Dashboard APIs
**Goal:** Serve data to the frontend interfaces.

- [x] **Task 6.1: Admin Complaint Read APIs**
  - Created `GET /api/admin/complaints` with query filters (`status`, `category`, `priorityBand`) and pagination.
  - *Status:* Completed.

- [x] **Task 6.2: Admin Action APIs**
  - Created `PATCH /api/admin/complaints/:id/status` (updates status, attaches `evidence` photo, logs `StatusHistory`).
  - Created `POST /api/admin/complaints/:id/merge` (confirm or reject duplicate link with score restoration).
  - *Status:* Completed.

- [x] **Task 6.3: Rules API & Stats**
  - Created `GET /api/admin/rules` and `PUT /api/admin/rules` with full queue score recalculation.
  - Added sensitive landmark zone management: `POST /api/admin/zones` and `DELETE /api/admin/zones/:id` with dynamic priority recalibration across all open tickets.
  - Created `GET /api/admin/stats` with `avgResolutionHours`, `slaOverdueCount` (>72h), and status/category metrics.
  - Added public `GET /api/complaints/transparency` for open municipal transparency metrics.
  - *Status:* Completed & verified.

- [x] **Task 6.4: Sensitive Landmark Zones & Admin Rules Integration (Frontend)**
  - Created `SensitiveZoneManager.tsx` UI to view, create, and delete sensitive buffer corridors with live coordinate presets and real-time recalibration toasts.
  - Connected `AdminDashboardPage` KPIs directly to `fetchAdminStats()` with dynamic SLA overdue warnings.
  - Connected public landing page (`page.tsx`) to `fetchTransparencyStats()` displaying live public ledger resolution rates.
  - *Status:* Completed & verified.

---

## Phase 7: Frontend Application Scaffolding & Shared Logic
**Goal:** Setup React/Next.js application, routing, API client, and store.

- [x] **Task 7.1: Init React/Next.js App & API Client**
  - Integrated Next.js 16 App Router frontend with complete Stitch dark/light theme.
  - Implemented `src/lib/api.ts` connecting directly to Express backend on `http://localhost:5000/api`.
  - Added seamless bidirectional category, status, and coordinate normalization.
  - *Status:* Completed & verified.

- [x] **Task 7.2: Map Component Base**
  - Interactive Leaflet map integration for geo-spatial pin selection, radius clustering, and municipal district overlays.
  - *Status:* Completed & verified.

---

## Phase 8: Resident Views (Frontend)
**Goal:** Interfaces for citizens to report and track complaints.

- [x] **Task 8.1: Complaint Submission Form**
  - Resident report page with image preview, dictation shortcut, GPS pin selector, and anonymous option.
  - Direct multipart upload to backend `POST /api/complaints` triggering automated keyword AI triage and duplicate matching.
  - *Status:* Completed & verified.

- [x] **Task 8.2: Resident Tracking View**
  - Real-time incident timeline reading from `StatusHistory` with before/after photo comparison and 72-hour reopen window.
  - *Status:* Completed & verified.

---

## Phase 9: Admin Dashboard (Frontend)
**Goal:** Command center for municipal workers.

- [x] **Task 9.1: Queue Table**
  - High-performance triage queue with search, ward and department filters, and priority score breakdown badges.
  - Connected live to `GET /api/admin/complaints` and `GET /api/complaints`.
  - *Status:* Completed & verified.

- [x] **Task 9.2: Interactive Cluster Map**
  - Full-screen interactive Leaflet map with priority heatmaps and custom category pins.
  - *Status:* Completed & verified.

- [x] **Task 9.3: Detail & Action Panel**
  - Modal workflows for status transitions, department assignment, resolution evidence photo logging, and duplicate merge/reject actions.
  - Connected to `PATCH /api/admin/complaints/:id/status` and `POST /api/admin/complaints/:id/merge`.
  - *Status:* Completed & verified.

---

## Phase 10: Final Integration & Seed Data
**Goal:** Prepare for a flawless demo.

- [x] **Task 10.1: Seed Script**
  - Created `src/seed/seed.js` with demo users (`admin@demo.com`, `resident@demo.com`), 3 sensitive zones, default rules, primary complaints, duplicate demo, and resolved complaint with after photo.
  - *Status:* Completed.

- [x] **Task 10.2: E2E Testing & Optimization**
  - Full end-to-end integration verified: submission -> automated AI categorization -> duplicate detection -> priority scoring -> admin dashboard -> status updates with evidence -> tracking timeline.
  - Optimistic store caching implemented for instant ("less loaded") page responsiveness.
  - Next.js build passes with 0 errors (`next build` compiled all 29 routes).
  - Expanded dataset to 12 realistic complaints with rich infrastructure photos, local municipal coordinates, full status diversity (New, Under Review, Assigned, In Progress, Resolved), duplicate clusters, and resolution evidence.
  - *Status:* Completed & verified.
