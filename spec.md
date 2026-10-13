# spec.md - What we are building

**Product:** Smart Civic Complaint Triage System (OpenHack'26, problem SC-01)  
**Team:** 2 people, 24 hours  
**One-line pitch:** Residents report a civic problem in under a minute; the system sorts, de-duplicates and prioritizes every report with transparent rules, so authorities fix the most important problems first and residents can see progress.

**Related docs:** `docs/API_CONTRACT.md` (routes), `docs/DATA_MODEL.md` (fields), `docs/FRONTEND_SPEC.md` (screens), `AGENTS.md` (rules for AI agents). If this spec and another doc disagree about what the product does, this spec wins. If they disagree about exact routes or fields, `docs/API_CONTRACT.md` wins.

---

## 1. Vision

Today a resident who sees a pothole or an overflowing bin has no easy way to report it, no idea if anyone saw it, and no way to know what happens next. Authorities receive scattered, repeated complaints with no clear order of importance.

We build a single web platform that:
- Makes reporting fast (text, photo, map pin).
- Automatically suggests a category and spots duplicate reports.
- Ranks every complaint with a score and shows the reasons, so decisions are transparent.
- Lets residents follow their complaint to resolution, including proof of the fix.

> **Design principle:** Automation suggests, humans decide. Every automatic result (category, duplicate link, priority) shows its reasoning and can be overridden by staff.

---

## 2. Target Users

| User | Who they are | What they want | What they must be able to do |
| :--- | :--- | :--- | :--- |
| **Resident** | Any citizen with a phone | Report fast, see that it was received, know when it is fixed | Submit a complaint without needing an account; track it; see their own complaints if logged in |
| **Administrator** | Municipal staff member | Know what to fix first, avoid handling the same issue twice | See a priority-sorted queue, confirm or reject duplicates, update status with evidence, tune the priority rules |
| **Judge / demo viewer** | Hackathon evaluator | Understand the value in 2 minutes | Follow one clear end-to-end story with realistic sample data |

*Field staff are simulated:* the admin records a department name and uploads an "after" photo on their behalf.

---

## 3. Goals and Success Criteria

- A resident can submit a complaint with photo and location in under 60 seconds on a phone.
- A new complaint is categorized, checked for duplicates and scored within 2 seconds, with no external API required.
- Two similar reports about the same spot are linked, and the original's priority rises.
- An admin can explain why any complaint has its score by reading the reasons shown in the UI.
- The full loop works live in the demo: `submit` -> `categorize` -> `duplicate` -> `prioritize` -> `admin action` -> `resident sees resolution`.

---

## 4. Core Features (MVP)

Each feature has acceptance criteria. A feature is done only when all of them are true.

### F1. Submit a complaint
- Resident enters a description (required), optional title, optional photo, optional category, and a location (map pin or "use my location").
- Login is optional; anonymous reports are allowed.
- **Accept when:** A complaint with a photo is saved, the resident sees a result card (suggested category with confidence, priority band with reasons, duplicate notice if any) and a link to the tracking page. Missing description or location shows a clear error and nothing is saved.

### F2. Automatic category suggestion
- The system suggests one of: `road_damage`, `garbage`, `streetlight`, `water_leakage`, `blocked_drain`, `other`.
- It shows the confidence and a one-line reason (matched keywords).
- If the resident picks a category, that choice is kept; the suggestion is still stored.
- **Accept when:** Obvious sample texts map to the right category, unknown text becomes "other" with low confidence, and staff can change the category later.

### F3. Duplicate detection
- A new complaint is flagged as a likely duplicate when it has the same category, is within 150 m of an open complaint, and its text is similar enough (threshold 0.5, configurable by environment).
- The original's duplicate count increases, which raises its priority.
- Admin can confirm (status becomes "duplicate") or reject the suggestion (the link is removed and the original's count goes back down).
- **Accept when:** The two seeded pothole complaints are linked, a garbage complaint nearby is not, and reject restores the original's score.

### F4. Transparent priority score
- Score is 0–100 from configurable rules: category severity, number of duplicates, closeness to a sensitive place (school, hospital, main road), age of the complaint, and photo evidence.
- Bands: High (70 and above), Medium (40–69), Low (below 40).
- Every complaint shows the list of reasons, for example *"road damage severity (+30), 3 duplicate reports (+18), 80 m from a school (+20)"*.
- **Accept when:** Adding a duplicate or moving a complaint next to a school raises its score, and the reasons list matches the number.

### F5. Admin dashboard
- Summary cards: total, high priority, resolved, average resolution time.
- Table sorted by priority with filters (status, category, band) and duplicate badges.
- Map with pins coloured by priority band.
- **Accept when:** The highest-priority open complaint is first, filters work, and clicking a row opens the detail page.

### F6. Status workflow with evidence
- Statuses: `new`, `under_review`, `assigned`, `in_progress`, `resolved`, `closed`; plus `duplicate` and `rejected`.
- Admin changes status with an optional note, a department, and (for resolved) an "after" photo.
- Every change is stored in a history timeline.
- **Accept when:** The history shows each step with date and note, and the after photo is visible to the resident.

### F7. Resident tracking
- `/track/:id` shows the current status, priority, photo, location and the full timeline.
- A logged-in resident also has a "My complaints" list.
- **Accept when:** A status change made by the admin appears on the tracking page after a refresh.

### F8. Configurable rules
- Admin can edit category severity, weights, thresholds and the sensitive zones.
- Saving re-scores all open complaints.
- **Accept when:** Changing a weight and saving visibly changes the ranking in the dashboard.

---

## 5. User Flows

### Flow A - Resident reports a problem
1. Open the site on a phone and land on the submit page.
2. Type what is wrong, add a photo, drop the pin (or tap "use my location").
3. Tap Submit.
4. See: *"Received - suggested category: Road damage (83%), priority: High, reasons..."*. If a similar report exists: *"A similar report already exists nearby; we linked yours so it gets attention sooner."*
5. Open the tracking link to follow progress.

### Flow B - Admin triages the queue
1. Log in as admin and open the dashboard.
2. Read the top of the queue (highest priority first).
3. Open a complaint, read the photo, AI suggestion and "why this priority".
4. Fix the category if needed, assign a department, set status to "assigned".

### Flow C - Admin handles a duplicate
1. Open a complaint that shows *"Possible duplicate of ..."*.
2. Compare it with the original.
3. Click Confirm (it becomes a duplicate) or Reject (it stays independent).

### Flow D - Resolve with evidence
1. Admin sets status to "in progress", then "resolved" with a note and an after photo.
2. The resident opens the tracking page and sees the full timeline with the proof.

### Flow E - Tune the rules
1. Admin opens Rules.
2. Raises the weight for "near a school" and saves.
3. Dashboard re-ranks; the demo shows a complaint moving up.

---

## 6. Business Rules

- **Categories (fixed):** `road_damage`, `garbage`, `streetlight`, `water_leakage`, `blocked_drain`, `other`.
- **Statuses:** `new`, `under_review`, `assigned`, `in_progress`, `resolved`, `closed`, `duplicate`, `rejected`.
- **Workflow sequence:** Normal progress is forward: `new` -> `under review` -> `assigned` -> `in progress` -> `resolved` -> `closed`. The UI should offer forward steps first; the API does not block other changes.
- **Duplicate checks:** Only compare open complaints of the same category; resolved, closed, rejected and duplicate complaints are ignored.
- **Authentication:** Anonymous reports are allowed; only admins can change status, categories, duplicates and rules.
- **Photos:** JPG, PNG or WEBP, up to 5 MB.
- **Suggestions:** Automatic results are suggestions: category, duplicate link and priority can all be corrected by staff.
- **Demo Data:** All demo data is sample data and must be labelled as such.

---

## 7. Screens (Summary)

- Submit
- Login/Register
- My complaints
- Tracking timeline
- Public map
- Admin dashboard
- Admin complaint detail
- Admin map
- Rules editor  
*(Full details are in `docs/FRONTEND_SPEC.md`)*

---

## 8. Non-Goals (Do NOT build these)

- Real integration with municipal or government systems.
- Native mobile apps (the web app must just work well on mobile).
- Training a custom machine-learning model.
- Payments, chat, comments between residents, social feeds, notifications by SMS.
- Multi-city or multi-tenant support.
- Anything not listed in section 4 until the feature freeze (hour 19) has passed.

---

## 9. Edge Cases to Handle

- **Description empty, or location missing:** Show an error, save nothing.
- **Wrong file type or file over 5 MB:** Show a clear message.
- **Photo missing:** Allowed, but the complaint scores 5 points lower.
- **No keyword match:** Category becomes "other", confidence low, admin should review.
- **Two complaints at the same spot but different problems (pothole vs garbage):** Not duplicates.
- **Admin rejects a duplicate:** Original's duplicate count and score go back down.
- **Admin opens a complaint ID that does not exist:** Show "Complaint not found".
- **Expired or missing login token:** Send the user to the login page.
- **Slow or failing network:** Loading indicator and a retry-friendly error message.

---

## 10. Demo Success Criteria

The demo must show, in this order, with no manual database edits:
1. The problem (a map with sample complaints).
2. A resident submits a pothole complaint with a photo; it is auto-categorized.
3. A second, similar complaint is submitted nearby; it is flagged as a duplicate.
4. The admin dashboard ranks the first complaint higher and explains why.
5. The admin changes one rule weight; the ranking updates.
6. The admin marks the complaint resolved with an after photo; the resident's timeline shows it.

**Fallbacks:** Seeded data is already loaded, keyword classification works with no internet, and a recorded video of the run-through exists.

---

## 11. Stretch Goals (Only after feature freeze)

- Urdu/Sindhi input with translation for admins.
- Notifications on status change.
- Complaint density heatmap.
- Public transparency page with average resolution time per category.
- Department SLA and overdue alerts.
- Optional LLM or embeddings upgrade for classification and similarity.

---

## 12. Glossary

- **Triage:** Sorting complaints by importance so the most urgent are handled first.
- **Duplicate:** A new report about the same problem at (almost) the same place as an open one.
- **Priority score:** 0–100 number built from transparent, editable rules.
- **Sensitive zone:** A place where problems matter more (school, hospital, main road), stored with a radius.
- **Evidence:** The "after" photo attached when a complaint is resolved.
