# AGENTS.md - how to build this project (rules for AI coding agents)

Project: SC-01 Smart Civic Complaint Triage System (OpenHack'26, 24-hour hackathon, team of two). This file is loaded every session. Follow it strictly. It overrides your default habits. (CLAUDE.md imports this file; for Cursor, copy it to .cursorrules or .cursor/rules/project.mdc.)

---

## 1. Read first, in this order
1. `spec.md` - what we are building, features, acceptance criteria, non-goals
2. `docs/ARCHITECTURE.md` - stack, folders, request flow
3. `docs/DATA_MODEL.md` - database fields and enums
4. `docs/API_CONTRACT.md` - exact routes and JSON shapes (source of truth for the API)
5. `docs/FRONTEND_SPEC.md` - pages, routes, UI rules
6. `docs/TASKS.md` - current task list and notes

Do not re-explore the whole repo each session. Use the docs, then open only the files your task needs.

---

## 2. Stack (fixed, do not change)

| Layer | Choice |
| :--- | :--- |
| **Backend** | Node.js 20+, Express 5, Mongoose 9, MongoDB, JWT (jsonwebtoken), bcryptjs, Multer, CORS, Morgan |
| **Frontend** | React + Vite, react-router-dom, axios, Leaflet / react-leaflet |
| **Language** | Plain JavaScript. Backend is CommonJS (require), frontend is ES modules (import) |
| **AI** | Local keyword classifier and text-similarity in `backend/src/services/`. An LLM may be added only behind those same functions, with the local version kept as fallback |

No TypeScript, no new frameworks, no ORM swap, no Redux or other state libraries, no UI component libraries unless the user asks.

---

## 3. Repo map and ownership

```
backend/    API (owner: backend dev)          frontend/   React app (owner: frontend dev)
  server.js                                      src/api/client.js     all HTTP calls
  src/config/db.js                               src/context/          AuthContext
  src/models/     User, Complaint, RuleSettings  src/components/       reusable UI
  src/routes/     auth, complaints, admin        src/pages/            one file per route
  src/services/   classifier, similarity,        src/App.jsx           routes and guards
                  priority, pipeline
  src/middleware/ auth, upload
  src/utils/      geo
  src/seed/seed.js     src/tests/logic.test.js
docs/       project docs      spec.md   product spec      AGENTS.md   this file
```

- Backend tasks: edit only `backend/`. Frontend tasks: edit only `frontend/`.
- Never touch the other person's folder. If the API must change, update `docs/API_CONTRACT.md` first and tell the user.
- Shared files (`README.md`, `docs/*`, `AGENTS.md`, root `.gitignore`) need a heads-up to the user before editing.

---

## 4. Commands

**Backend (inside `backend/`):**
```bash
npm install
npm run dev          # API on http://localhost:5000
npm run test:logic   # classifier / similarity / priority checks (no database needed)
npm run seed         # WIPES users, complaints and rules, then reloads demo data (see rule D6)
```

**Frontend (inside `frontend/`):**
```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # must pass before a big commit
```

**Environment variables:**
- Backend: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `DUP_RADIUS_METERS`, `DUP_SIM_THRESHOLD`
- Frontend: `VITE_API_URL`
- Demo logins after seeding: admin `admin@demo.com` / `admin123`, resident `resident@demo.com` / `resident123`.

---

## 5. Code style and size limits
- **Files:** keep every file under 300 lines (hard limit 400). Split by responsibility before it grows.
- **Functions:** under 50 lines, one job each. React components under 150 lines; extract subcomponents or hooks.
- **Naming:** camelCase for variables and functions, PascalCase for React components and Mongoose models, UPPER_SNAKE for constants, kebab-case not used for JS files (use camelCase.js or PascalCase.jsx).
- **Syntax:** const by default, async/await (no callbacks, no .then chains), strict equality, early returns over deep nesting.
- **Comments:** explain why, not what. No commented-out code, no leftover console.log (keep the existing startup logs and console.error in error handlers).
- **Formatting:** 2 spaces, single quotes, semicolons, trailing commas in multiline literals. Match the style of the surrounding file.
- **Duplication:** reuse existing helpers and services before writing new ones. Do not copy logic between files.
- **Imports:** no unused imports or variables.

---

## 6. Backend rules
- **Layers:** `routes/` handle HTTP only (validate input, call services, send JSON). Business logic lives in `services/`. Schemas live in `models/`.
- New complaints always go through `services/pipeline.js` -> `processComplaint()` (classify, duplicate check, priority). Never re-implement that in a route.
- Priority weights come from the `RuleSettings` document. Never hard-code weights, thresholds or category scores in routes.
- Every route returns JSON. Errors are `{ "error": "message" }` with the right status (400 bad input, 401 not logged in, 403 not admin, 404 not found, 409 conflict, 500 server). Wrap handlers in try/catch and call `next(e)` as the existing routes do.
- Validate all input (required fields, enum values, number parsing) before touching the database. Invalid ObjectIds must return 404, not crash.
- Protect admin routes with `auth(true)` + `requireAdmin`. Never trust a role sent by the client; roles come from the JWT.
- Never return `passwordHash`. Never log passwords, tokens or the `.env` contents.
- Uploads: only jpg, png or webp, max 5 MB, saved through `middleware/upload.js`. Multer field names are exactly `photo` (submit) and `evidence` (status update).
- AI output is a suggestion: store confidence and reason, never present it as final, and always let staff override.
- Express 5 notes: wildcard routes need a name (for example `/*splat`), and async errors are forwarded automatically. Mongoose 9: use promises, no callbacks.

---

## 7. Frontend rules
- All HTTP goes through `src/api/client.js` (axios instance, base URL from `import.meta.env.VITE_API_URL`, `Authorization: Bearer <token>` read from `localStorage.token`). Components never call axios directly.
- Every request shows a loading state and an error message (use `error` from the response body). No silent failures, no blank screens.
- Mobile-first. Everything must be usable at 360 px width.
- Show the priority score together with its reasons, and label the AI category as "Suggested".
- Image URLs from the API are relative (`/uploads/x.jpg`): prefix with the API base URL.
- Colors follow `docs/FRONTEND_SPEC.md`; never rely on color alone (always show the text label too).
- Guard admin routes: no token or non-admin role redirects to `/login`.
- Forms: disable the submit button while sending, validate required fields before the request, keep user input after an error.
- Leaflet: import `leaflet/dist/leaflet.css` once; fix the default marker icon if pins do not appear.

### 7b. API contract discipline
- Do not invent routes, fields, enum values or status codes. If something is missing, propose the change in `docs/API_CONTRACT.md`, tell the user, and wait.
- If you change a route or a response shape, update `docs/API_CONTRACT.md` and `docs/DATA_MODEL.md` in the same change.

---

## 8. Do and Don't

### DO
- **D1.** Make the smallest change that completes the task. Edit existing code in place.
- **D2.** Write one small task at a time, test it, then stop and report.
- **D3.** Handle empty states, errors and slow networks.
- **D4.** Keep the demo path working at all times: submit -> auto category -> duplicate flag -> priority -> admin dashboard -> status update -> resident tracking.
- **D5.** Add or update a check in `backend/src/tests/logic.test.js` when you change the classifier, similarity or priority logic, and run `npm run test:logic`.
- **D6.** Ask the user before running `npm run seed` against a shared or Atlas database: it deletes all users, complaints and rules.
- **D7.** Tick the task in `docs/TASKS.md` when done and add a one-line note for any decision you made.
- **D8.** Tell the user what to click or call to test your change.

### DON'T
- **N1.** Do not commit, print or create real secrets. `.env` is git-ignored; document variables only in `.env.example`.
- **N2.** Do not add dependencies without saying which package and why. Prefer what is already installed.
- **N3.** Do not rewrite whole files, reformat unrelated code, or rename/move/delete files, routes, fields or collections without asking.
- **N4.** Do not build anything outside `spec.md` section 4 (MVP). Stretch goals only after the user confirms the feature freeze (hour 19) has passed.
- **N5.** Do not drop collections, wipe the database, or change enum values outside the seed script without asking.
- **N6.** Do not disable security or validation (CORS, auth middleware, upload filters) to make something "just work".
- **N7.** Do not leave stubs, fake data in production code paths, or TODO code presented as finished. Mark unfinished work clearly in `docs/TASKS.md`.
- **N8.** Do not use `git push --force`, `git reset --hard` or delete branches. Do not commit `node_modules`, `.env`, or uploaded photos.
- **N9.** Do not change files in the other person's folder.
- **N10.** Do not hide failures. If a test or build fails and you cannot fix it, say so plainly with the error.

---

## 9. Git rules
- The user runs `git commit` and `git push`. If asked to commit, use small commits with imperative messages (`Add complaint submit page`).
- Run `git pull --rebase origin main` before pushing. Resolve conflicts by keeping both sides' intent; ask if unsure.
- One logical change per commit. Do not mix backend and frontend work in one commit.

---

## 10. Definition of done (check before saying "done")
- The feature works end to end (you tested the route or page, not just wrote the code).
- It matches `spec.md` acceptance criteria and `docs/API_CONTRACT.md`.
- Errors and loading states are handled.
- `npm run test:logic` passes if services changed; `npm run build` passes if the frontend changed.
- No unused code, debug logs, secrets or files over the size limits.
- `docs/TASKS.md` is updated.
- Your final message has three lines: what changed, how to test it, anything to watch.

---

## 11. Working style
- Start by restating the task in one sentence and naming the files you will touch.
- If the task is ambiguous, pick the simplest option that matches the docs, note it in `docs/TASKS.md`, and continue. Ask the user only when a choice would change the API contract or delete existing work.
- Fix the cause, not the symptom: explain a bug in two lines before changing code.
- Keep each session focused. When the conversation gets long or you lose track, tell the user to start a fresh session and re-read the docs.
