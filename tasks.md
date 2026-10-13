# 📝 Execution Plan & Task List (tasks.md)

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

- [x] **Task 2.1: Setup Multer for Image Uploads**
  - Installed `multer`. Created `middleware/upload.js` (5 MB max, jpg/png/webp, fields `photo` and `evidence`).
  - Statically serve `/uploads` via Express.
  - *Status:* Completed.

- [x] **Task 2.2: Basic Complaint Submission Endpoint**
  - Created `POST /api/complaints` route accepting multipart form data.
  - Saves to DB, sets status, calculates priority, and logs status history.
  - *Status:* Completed.

- [x] **Task 2.3: Simple Authentication (Hackathon MVP)**
  - Created `POST /api/auth/login` and `POST /api/auth/register` returning JWT.
  - Created auth middleware `middleware/auth.js` (`auth(required)`, `requireAdmin`).
  - *Status:* Completed.

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
  - Created `GET /api/admin/stats` for overview KPIs.
  - *Status:* Completed.

---

## Phase 7: Frontend Application Scaffolding & Shared Logic
**Goal:** Setup React, routing, and map dependencies.

- [ ] **Task 7.1: Init React/Vite App**
  - Create `frontend/` directory using Vite. Install React Router, axios, and leaflet / react-leaflet.

- [ ] **Task 7.2: Map Component Base**
  - Create a reusable `<MapSelector />` component that allows dropping a pin and returning lat/lng.

---

## Phase 8: Resident Views (Frontend)
**Goal:** Interfaces for citizens to report and track.

- [ ] **Task 8.1: Complaint Submission Form**
  - Build UI with description text area, photo upload preview, and `<MapSelector />`.
  - Wire to `POST /api/complaints`. Add loading state while AI processes.

- [ ] **Task 8.2: Resident Tracking View**
  - Build UI to display `GET /api/complaints/:id`.
  - Render a visual timeline reading from the `StatusHistory` array.

---

## Phase 9: Admin Dashboard (Frontend)
**Goal:** Command center for municipal workers.

- [ ] **Task 9.1: Queue Table**
  - Fetch and display `GET /api/admin/complaints`.
  - Show columns for Category, Priority Score (with color-coded badges), Status, and Duplicate Count.

- [ ] **Task 9.2: Interactive Cluster Map**
  - Render active complaints on a full-screen Leaflet map. Color markers based on priority (Red=High, Yellow=Medium, Green=Low).

- [ ] **Task 9.3: Detail & Action Panel**
  - Clicking a row/pin opens a detail view.
  - Build UI to change status, upload an after-photo, and view AI reasoning/duplicate suggestions.

---

## Phase 10: Final Integration & Seed Data
**Goal:** Prepare for a flawless demo.

- [x] **Task 10.1: Seed Script**
  - Created `src/seed/seed.js` with demo users (`admin@demo.com`, `resident@demo.com`), 3 sensitive zones, default rules, primary complaints, duplicate demo, and resolved complaint with after photo.
  - *Status:* Completed.

- [ ] **Task 10.2: E2E Testing**
  - Run through the full demo script: Submit -> Verify AI category -> Trigger duplicate -> Resolve via Admin -> Check resident timeline.
