# Technical Architecture & Implementation Plan
## Smart Civic Complaint Triage System (SC-01)

**Team Division:** Backend (API, AI, DB) | Frontend (UI, Map, Dashboards)  
**Stack:** Node.js, Express, MongoDB (Mongoose), React/HTML, Leaflet, LLM APIs  

---

## 1. System Architecture & Request Flow

```
+-------------------------------------------------------------------------------+
|                               FRONTEND (React)                                |
| - Resident Submit Form (Photo + Map Pin)                                      |
| - Resident Tracking Timeline                                                  |
| - Admin Dashboard & Interactive Map                                           |
| - Rule Configuration Settings                                                 |
+-------------------------------------------------------------------------------+
                                        |
                                        | HTTP REST Requests
                                        v
+-------------------------------------------------------------------------------+
|                            BACKEND (Express API)                              |
|                                                                               |
| [Auth Middleware] ---> [Multer Upload] ---> [AI Pipeline / Duplicate Search]  |
|                                                              |                |
|                                                              v                |
|                                                  [Priority Scoring Engine]    |
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                              DATA & AI SERVICES                               |
| - MongoDB (Mongoose Collections: Users, Complaints, StatusHistory, Rules)     |
| - LLM Vision/Text API (Category Auto-suggest & Summarization)                 |
| - Text Embedding API + Cosine Similarity (Duplicate Detection)                |
+-------------------------------------------------------------------------------+
```

### Complete End-to-End Execution Path

1. **Resident Submission:** Resident fills the complaint form, drops a location pin, attaches a photo, and submits.
2. **Backend Processing & Upload:** Express receives multipart form data, handles the photo upload via multer, and writes an initial draft to MongoDB.
3. **AI Pipeline Processing:**
   - Text & Image sent to LLM for classification (returns category, confidence, and reasoning).
   - Description processed through Embedding API to generate vector coordinates.
4. **Duplicate Detection:** Nearby active complaints in the same category within radius are checked via cosine vector similarity. If similarity > threshold, flag as a duplicate and reference the target complaint.
5. **Priority Engine:** Compute total priority score (0–100) using rule settings (category weight, duplicates, proximity to sensitive zones, age, photo evidence).
6. **Admin Dashboard Dispatch:** Complaint is displayed on Admin Board and Interactive Map sorted by Priority Score.
7. **Resolution Workflow:** Staff updates status, attaches resolution proof (after-photo), which immediately updates the resident’s tracking timeline.

---

## 2. Database Schema (MongoDB / Mongoose)

### Collection: `complaints`

| Field | Type | Options / Notes |
| :--- | :--- | :--- |
| `_id` | ObjectId | Auto-generated Primary Key |
| `title` | String | Required |
| `description` | String | Required |
| `category` | String | Enum: Road damage, Garbage, Streetlight, Water leak, Blocked drains |
| `aiCategory` | String | AI-suggested category |
| `aiConfidence` | Number | Value between 0.0 and 1.0 |
| `photoUrl` | String | Stored file path or URL |
| `location` | Object | `{ lat: Number, lng: Number, address: String }` |
| `embedding` | Array | Array of Numbers (Vector representation for description) |
| `status` | String | Enum: New, Under review, Assigned, In progress, Resolved, Duplicate |
| `priorityScore` | Number | 0 – 100 |
| `priorityReasons` | Array | List of Strings explaining the score breakdown |
| `duplicateOf` | ObjectId | Reference to complaints ID if marked duplicate |
| `duplicateCount` | Number | Default: 0 |
| `createdAt` | Date | Timestamp (Default: `Date.now`) |

### Collection: `statusHistory`

| Field | Type | Options / Notes |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `complaintId` | ObjectId | Reference to `complaints` |
| `status` | String | Enum matching status workflow |
| `note` | String | Explanation for status change |
| `evidencePhotoUrl` | String | Resolution proof / after-photo |
| `changedBy` | ObjectId | Reference to `users` |
| `changedAt` | Date | Timestamp |

### Collections: `users` & `ruleSettings`

| Collection | Fields | Notes |
| :--- | :--- | :--- |
| `users` | `_id`, `name`, `email`, `passwordHash`, `role` | Roles: `resident`, `admin` |
| `ruleSettings` | `categoryWeights`, `duplicateWeight`, etc. | Used by priority engine |
| `sensitiveZones` | `name`, `type`, `lat`, `lng`, `radius` | Types: `school`, `hospital`, `road` |

---

## 3. REST API Contract & Endpoints

| Method | Endpoint | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Login resident or admin, return JWT |
| `POST` | `/api/complaints` | Resident | Submit new complaint with text/photo/location |
| `GET` | `/api/complaints/mine` | Resident | Fetch logged-in user’s complaints |
| `GET` | `/api/complaints/:id` | Public | Fetch details, timeline, and priority reasons |
| `GET` | `/api/admin/complaints` | Admin | Query queue with filters & sorting |
| `PATCH` | `/api/admin/complaints/:id/status` | Admin | Update status, append note & after-photo |
| `POST` | `/api/admin/complaints/:id/merge` | Admin | Confirm/reject AI duplicate link |
| `GET` | `/api/admin/rules` | Admin | Read current priority calculation weights |

---

## 4. Key Subsystem Design Decisions

### A. AI Pipeline Design & Safety Fallbacks
- **Category Classification:** Passes text description and image URL to LLM API. Expects a strict JSON payload:  
  `{ "category": "...", "confidence": 0.92, "reason": "..." }`.
- **Fallback Strategy:** If the LLM call fails, execute keyword regex matching against the description (e.g., matching "pothole", "garbage", "leak").
- **Human Control:** AI outputs are marked purely as suggestions; admins and residents retain permission to manually override.

### B. Duplicate Detection Algorithm
1. Generate description vector embedding via API.
2. Perform a MongoDB spatial query finding non-resolved complaints of same category within 100m radius.
3. Calculate Cosine Similarity ($S_c$) between the vector embeddings:
   $$S_c = \frac{A \cdot B}{\|A\| \|B\|}$$
4. If $S_c \ge 0.80$, flag as potential duplicate, link to target complaint ID, and increment `duplicateCount` on the original.

### C. Configurable Priority Scoring Engine
Total Priority Score ($0 \le P \le 100$) is calculated dynamically:
$$P = W_{\text{cat}} + W_{\text{dup}} + W_{\text{zone}} + W_{\text{age}} + W_{\text{photo}}$$

- **Category Severity ($W_{\text{cat}}$):** Max 35 points based on category configuration.
- **Duplicate Impact ($W_{\text{dup}}$):** Max 25 points ($\min(25, \text{duplicateCount} \times 5)$).
- **Sensitive Location ($W_{\text{zone}}$):** Max 20 points if within range of registered schools/hospitals.
- **Age Factor ($W_{\text{age}}$):** Max 15 points (adds points for unresolved age).
- **Photo Proof ($W_{\text{photo}}$):** Max 5 points if valid image uploaded.

---

## 5. Implementation Milestones (24-Hour Timeline)

### [Hours 0–3] Setup & Basic Submission
- **Backend:** Initial DB schemas, Express setup, `POST /api/complaints` + Multer
- **Frontend:** Form UI, photo selector, Leaflet map pin picker

### [Hours 3–9] Core AI & Duplicate Logic
- **Backend:** Integration with LLM, Embedding API, Cosine duplicate checker
- **Frontend:** Tracking timeline view, user complaint list

### [Hours 9–15] Priority Engine & Admin Suite
- **Backend:** Scoring Engine, Admin filter endpoints, Status + photo upload
- **Frontend:** Admin Dashboard table, interactive cluster map, rule settings sliders

### [Hours 15–19] Polishing & Seed Data
- **Backend:** Seed ~40 realistic city complaints, edge-case testing, fallbacks
- **Frontend:** Priority badges, status transitions, UI responsiveness polish

### [Hours 19–24] Freeze & Demo Preparation
- **Feature Freeze at Hour 19**
- Full E2E Loop Verification (Resident -> AI -> Admin -> Resolution)
- Live Demo Rehearsal & Backup Recording Preparation
