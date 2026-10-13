# 📝 Execution Plan & Task List (tasks.md)

**Context:** Smart Civic Complaint Triage System (SC-01)  
**Goal:** Build the system in atomic, testable, dependency-aware steps.  
**Instructions for AI Agent:** Do not skip steps. Complete one phase entirely and verify it works before moving to the next. Do not generate large chunks of unrelated UI and Backend code at the same time.

---

## Phase 1: Project Initialization & Database Foundation
**Goal:** Scaffold the backend and ensure database connectivity.

- [x] **Task 1.1: Initialize Node Project**
  - Create project directory `backend/`.
  - Run `npm init -y` and install core dependencies: `express`, `mongoose`, `cors`, `dotenv`.
  - Setup basic `server.js` with Express and a `/health` test route.
  - *Test:* `curl localhost:5000/api/health` returns 200 OK.
  - *Status:* Completed.

- [x] **Task 1.2: Database Connection**
  - Setup MongoDB connection in `config/db.js` using `mongoose`.
  - Load connection string from `.env`.
  - *Test:* Server logs "MongoDB Connected" on startup.
  - *Status:* Completed.

- [x] **Task 1.3: Define Mongoose Models (Core)**
  - Create `models/Complaint.js` matching the schema in `plan.md` (include geospatial index for location).
  - Create `models/User.js` (`name`, `email`, `passwordHash`, `role`).
  - Create `models/StatusHistory.js`.
  - Create `models/RuleSettings.js` (with default weights) and `models/SensitiveZone.js`.
  - *Test:* Successfully create one dummy user and one dummy complaint via a temporary script or REPL.
  - *Status:* Completed & validated.

---

## Phase 2: Core API & File Uploads
**Goal:** Allow residents to submit basic complaints with photos.

- [ ] **Task 2.1: Setup Multer for Image Uploads**
  - Install `multer`. Create `middlewares/upload.js` configured to save files to a local `/uploads` directory.
  - Make the `/uploads` folder statically accessible via Express.

- [ ] **Task 2.2: Basic Complaint Submission Endpoint**
  - Create `POST /api/complaints` route.
  - Accept multipart form data (image, title, description, lat, lng).
  - Save to DB with default status `'New'` and a dummy priority score.
  - *Test:* POST request via Postman saves the file and returns a 201 Created with the complaint ID.

- [ ] **Task 2.3: Simple Authentication (Hackathon MVP)**
  - Create `POST /api/auth/login` (hardcode a resident and admin user for quick hackathon access, returning a simple JWT).
  - Create auth middleware `middlewares/auth.js` to protect admin/resident routes.

---

## Phase 3: AI Pipeline Integration
**Goal:** Auto-categorize and embed complaint descriptions.

- [ ] **Task 3.1: LLM Classification Service**
  - Create `services/aiService.js`.
  - Write a function `classifyComplaint(text, imageUrl)` that calls the LLM API (e.g., OpenAI/Gemini).
  - Enforce JSON response format: `{ "category": "...", "confidence": 0.9, "reason": "..." }`.
  - Implement a fallback regex keyword matcher if the API fails.

- [ ] **Task 3.2: Text Embedding Service**
  - Add `generateEmbedding(text)` to `aiService.js` that calls the chosen embedding API.
  - Returns an array of floats.

- [ ] **Task 3.3: Wire AI into Submission Flow**
  - Update `POST /api/complaints`: Await `classifyComplaint` and `generateEmbedding` before saving.
  - Save `aiCategory`, `aiConfidence`, and `embedding` to the Complaint document.
  - *Test:* Submit a complaint; verify the DB record contains valid AI-generated fields.

---

## Phase 4: Duplicate Detection Engine
**Goal:** Prevent duplicate reports using spatial queries and vector similarity.

- [ ] **Task 4.1: Cosine Similarity Utility**
  - Create `utils/math.js` and write a `calculateCosineSimilarity(vecA, vecB)` function.
  - Write unit tests for this function to ensure accuracy.

- [ ] **Task 4.2: Proximity Query Logic**
  - Create `services/duplicateService.js`.
  - Write a function `findDuplicates(newComplaint)` that:
    - Queries MongoDB for open complaints in the same `aiCategory` within 100m.
    - Loops through results, calculating cosine similarity against `newComplaint.embedding`.
    - If `similarity >= 0.80`, returns the closest match ID.

- [ ] **Task 4.3: Integrate Duplicate Logic**
  - Update `POST /api/complaints`: Run `findDuplicates`.
  - If a duplicate is found, set status to `'Duplicate'`, link `duplicateOf`, and increment `duplicateCount` on the original.

---

## Phase 5: Priority Scoring Engine
**Goal:** Calculate urgency dynamically based on configurable rules.

- [ ] **Task 5.1: Priority Calculation Service**
  - Create `services/priorityService.js` with `calculatePriority(complaint, rules)`.
  - Implement formula: $W_{cat} + W_{dup} + W_{zone} + W_{age} + W_{photo}$.
  - Write a geospatial query to check if the complaint is within the radius of any `SensitiveZone`.

- [ ] **Task 5.2: Apply Priority on Creation & Updates**
  - Update `POST /api/complaints`: Calculate and save `priorityScore` and `priorityReasons` array before finalizing the save.
  - *Test:* Manually verify the math for a seeded complaint matches expectations.

---

## Phase 6: Admin Dashboard APIs
**Goal:** Serve data to the frontend interfaces.

- [ ] **Task 6.1: Admin Complaint Read APIs**
  - Create `GET /api/admin/complaints` with query filters (status, category) and sort by `priorityScore DESC`.

- [ ] **Task 6.2: Admin Action APIs**
  - Create `PATCH /api/admin/complaints/:id/status` (updates status, logs to `StatusHistory`, handles after-photo upload).
  - Create `POST /api/admin/complaints/:id/merge` (accept/reject AI duplicate links).

- [ ] **Task 6.3: Rules API**
  - Create `GET /api/admin/rules` and `PUT /api/admin/rules` to manage weights.
  - Update PUT route to trigger a background recalculation of all active complaint priorities (Hackathon shortcut: just update rules, recalculate on fetch if needed).

---

## Phase 7: Frontend Application Scaffolding & Shared Logic
**Goal:** Setup React, routing, and map dependencies.

- [ ] **Task 7.1: Init React/Vite App**
  - Create `frontend/` directory using Vite. Install React Router, TailwindCSS/Vanilla CSS, axios, and leaflet / react-leaflet.

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

- [ ] **Task 10.1: Seed Script**
  - Create `seed.js` to populate DB with 5 sensitive zones, default rules, and 20 realistic complaints clustered in specific areas.

- [ ] **Task 10.2: E2E Testing**
  - Run through the full demo script: Submit -> Verify AI category -> Trigger duplicate -> Resolve via Admin -> Check resident timeline.
