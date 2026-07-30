# Z-SeHealth — MEMORY.md
> **⚠️ MUST BE UPDATED after every session or feature change.**
> This file is the living memory of the project — its current state, what's done, what's in progress, and what's next.
> **Last Updated:** 2026-07-30 (Session: Multi-meal selection + Rules/Memory docs)

---

## 🗓️ Last Session Summary
**Date:** 2026-07-30
**Work Done — Freemium Model (Phase 1–4 Implementation):**

### Phase 1 — Database Layer ✅
- Updated `/api/auth/sync` in `main.py` to create new users with full freemium schema: `tier`, `subscription`, `usage`
- Added backward-compatible migration: existing users get freemium fields on next login if `tier` field is missing

### Phase 2 — Backend Services & Routes ✅
- Created `backend/middleware/__init__.py` + `backend/middleware/quota_check.py` (scan quota enforcement, Option-B monthly reset-on-read)
- Created `backend/services/__init__.py` + `backend/services/sarvam_client.py` (Sarvam AI for Elite tier — key stored in .env, never called by agent)
- Created `backend/services/ai_router.py` (tier-based AI routing: Elite→Sarvam+NVIDIA+Gemini, Pro→NVIDIA+Gemini, Starter→NVIDIA+Gemini, Free→NVIDIA+Gemini)
- Created `backend/routes/subscriptions.py` (GET /plans, GET /status, POST /create, POST /cancel)
- Created `backend/routes/webhooks.py` (POST /api/webhooks/razorpay with HMAC-SHA256 verification)
- Updated `backend/main.py`: router registration, quota middleware wired into /api/scan, new scan endpoint with tier-based routing

### Phase 3 — Payment Setup & Bug Fixes ✅
- **Render Deployment Fix**: Fixed `NameError: name 'RAZORPAY_PLAN_IDS' is not defined` in `subscriptions.py` by replacing top-level dictionary references with `None` defaults (dynamically injected in `/plans` route) and restored `router = APIRouter(...)` in `webhooks.py`.
- **Import Order Fix**: `main.py` now calls `load_dotenv()` before route imports.
- Verified backend import via `python -c "import main; print('OK')"` — passes cleanly with 0 errors.
- Configured local environment files (`backend/.env` and `frontend/.env.local`) with live Razorpay Key ID (`rzp_test_TJnCHL1p8iDlzM`), Razorpay Secret, Webhook Secret, Subscription Plan IDs (`plan_TJnZj0mYVfrW7N`, `plan_TJncvgHhDOKAaA`, `plan_TJneBOM7B71JUl`), and Sarvam AI Key.
- Sanitized `backend/.env.example` and created `frontend/.env.example` templates for safe version control.



### Phase 4 — Frontend ✅
- Created `frontend/src/components/PricingPage.tsx` (4-tier card UI with Razorpay checkout integration)
- Created `UpgradeModal.tsx` (quota limit popup with upgrade options)
- Created `UsageIndicator.tsx` (scan bar for Dashboard — compact + full variants)
- Created `SubscriptionBadge.tsx` (tier badge for Profile + Dashboard)
- Created `PaymentStatus.tsx` (success/failure screen with copyable UPI receipt + contact support)
- Updated `UserStatsContext.tsx` (tier, scansUsed, scanLimit, upgradePlan, refreshSubscription, showUpgradeModal)
- Updated `App.tsx` (pricing tab, PaymentStatus overlay, payment event listeners)
- Updated `Dashboard.tsx` (UpgradeModal + UsageIndicator + SubscriptionBadge integration)
- Updated `Profile.tsx` (SubscriptionBadge integration)

**Build:** ✅ `npm run build` passed — 1793 modules, 0 TypeScript errors
**Backend syntax:** ✅ All 6 new Python files pass `py_compile`

---

## ✅ Completed Features

### Core Infrastructure
- [x] **Project Bootstrap** — React 19 + Vite + TypeScript frontend with Tailwind CSS v4
- [x] **FastAPI Backend** — Python backend with async architecture
- [x] **MongoDB Integration** — `motor` async driver connected to MongoDB Atlas (`Z-sehealth` DB)
- [x] **Firebase Authentication** — Google sign-in + email/password auth on the frontend
- [x] **Firebase Admin SDK** — Backend token verification on all protected routes
- [x] **CORS Setup** — Configured for localhost + `*.vercel.app` wildcard

### Authentication & User System
- [x] **Login Modal** — `LoginModal.tsx` — Google and email/password sign-in
- [x] **Auth Context** — `AuthContext.tsx` — Firebase user state management
- [x] **User Sync** — `POST /api/auth/sync` — Syncs Firebase user to MongoDB on login
- [x] **Login Streak** — Streak counter incremented on consecutive daily logins

### Dashboard
- [x] **Dashboard UI** — `Dashboard.tsx` — Daily macro rings, streak display, recent meal log
- [x] **User Stats Context** — `UserStatsContext.tsx` — Fetches and manages daily stats (calories, protein, carbs, fat)
- [x] **Quick Scan Camera** — Camera container on Dashboard that captures photo and navigates to Scan tab with image pre-loaded
- [x] **Streak Display** — Shown in navbar (desktop) and Dashboard

### Search Tab
- [x] **Food Search** — `Search.tsx` — Searches MongoDB `foods` collection by name
- [x] **AI Fallback** — When DB returns no results, triggers Ollama → NVIDIA → Gemini AI chain to generate food data
- [x] **Non-Food Detection** — AI returns `{"error": "..."}` for non-food queries, displayed as a user-friendly error
- [x] **Recently Viewed** — LocalStorage-persisted carousel of last 15 clicked food items
- [x] **Show More Pagination** — `visibleCount` state controls how many grid cards are shown (18 at a time)
- [x] **Multiple Log Meal Selection** — Multi-select food cards with:
  - Emerald border highlight + `X Selected` badge on selected cards
  - Per-card `−` / `Selected (N)` / `+` controls
  - Bottom-right floating counter bar (slide-up animation) with `−`, count, `+`, and clear `X`
  - Top-right Tick confirmation button (below navbar, `top-32 md:top-28`) with total count badge
  - `logMultipleMeals()` batch API call on confirmation
  - Success toast notification on completion
- [x] **Language Translator Modal** — Translates all ingredient names/descriptions to 50+ Indian languages
- [x] **Language Search** — Search filter inside the translator modal
- [x] **Options Modal** — Per-food-item options popup (translator + "Coming Soon" stubs)

### Scan Tab
- [x] **Scan Page** — `Scan.tsx` — Camera capture or image upload
- [x] **AI Image Analysis** — Sends image to Ollama → NVIDIA Vision → Gemini vision fallback chain
- [x] **Non-Food Image Detection** — Returns `has_ingredients: false` for non-food images
- [x] **Log Meal from Scan** — Scan results include a "Log Meal" button

### Profile & Settings
- [x] **Profile Page** — `Profile.tsx` — Edit health profile (age, gender, height, weight)
- [x] **Preferences** — Diet type and allergy settings
- [x] **Settings Page** — `Settings.tsx` — Notifications, dark mode, language preference toggle
- [x] **User Profile Context** — `UserProfileContext.tsx` — Fetches/saves user profile and settings

### Backend AI System
- [x] **Multi-model Fallback Chain** — Ollama → NVIDIA (multi-key) → Gemini for: scan, search, translate, macros
- [x] **Multiple NVIDIA API Keys** — Rotates through `NVIDIA_API_KEY` through `NVIDIA_API_KEY_5`
- [x] **Configurable AI Models** — `NVIDIA_VISION_MODEL` and `NVIDIA_TEXT_MODEL` via `.env`
- [x] **Macro Estimation** — `POST /api/user/log_meal` estimates nutrition macros via AI + updates daily stats
- [x] **Translation API** — `POST /api/translate` batch-translates ingredient lists
- [x] **Food Seeding** — Auto-seeds DB with 1,000 Indian food items on first startup

### Config & DevOps
- [x] **Centralized API_BASE** — `frontend/src/config.ts` — Single source of truth for API URL (trailing slash stripped)
- [x] **Environment Variable Templates** — `.env.example` documents all required keys
- [x] **GitHub Repository** — `https://github.com/farhanahmad2106-cpu/Z-SeHealth` — main branch

---

## 🔨 Currently Active / In-Progress

> Update this section whenever starting new work. Mark as done when merged.

| Status | Feature | File(s) | Notes |
|---|---|---|---|
| ✅ Done | RULES.md + MEMORY.md | `RULES.md`, `MEMORY.md` | Created this session |
| 💤 Paused | Freemium Subscription Model | Multiple files (TBD) | Detailed footprint saved — not yet started |

---

## 📂 Key Files Reference

| File | Purpose | Last Modified |
|---|---|---|
| `frontend/src/App.tsx` | Root app, sticky navbar, tab-based routing | 2026-07-30 |
| `frontend/src/config.ts` | `API_BASE` constant (single source of truth) | 2026-07-30 |
| `frontend/src/firebase.ts` | Firebase app + Auth initialization | 2026-06-25 |
| `frontend/src/index.css` | Tailwind v4 import, CSS variables, custom utilities | 2026-06-25 |
| `frontend/src/components/Dashboard.tsx` | Dashboard UI + quick scan camera | 2026-07-30 |
| `frontend/src/components/Search.tsx` | Search + multi-meal selection | **2026-07-30** |
| `frontend/src/components/Scan.tsx` | AI food scanning | 2026-07-30 |
| `frontend/src/components/Profile.tsx` | Health profile editing | 2026-06-25 |
| `frontend/src/components/Settings.tsx` | App settings | 2026-06-25 |
| `frontend/src/components/auth/LoginModal.tsx` | Firebase login UI | 2026-06-25 |
| `frontend/src/context/AuthContext.tsx` | Firebase auth state | 2026-06-25 |
| `frontend/src/context/UserStatsContext.tsx` | Daily stats + logMeal + logMultipleMeals | **2026-07-30** |
| `frontend/src/context/UserProfileContext.tsx` | User health profile + settings | 2026-07-30 |
| `backend/main.py` | All FastAPI routes + AI fallback chain | **2026-07-30** |
| `backend/requirements.txt` | Python dependencies (pinned) | 2026-07-30 |
| `backend/seed_1000.py` | 1000 Indian food DB seeder | 2026-06-25 |
| `backend/mock_foods.json` | Fallback food data (local) | 2026-06-25 |
| `backend/.env` | Local secrets (NOT committed) | — |
| `backend/.env.example` | Secret key template | 2026-07-30 |
| `RULES.md` | Development rules and conventions | **2026-07-30** |
| `MEMORY.md` | This file — project state | **2026-07-30** |
| `Z-SeHealth_project_features.md` | Feature list and roadmap | 2026-07-30 |

---

## 📡 API Endpoints Reference

| Method | Endpoint | Auth Required | Purpose |
|---|---|---|---|
| `GET` | `/api/foods?search=` | ❌ | Search food items (DB + AI fallback) |
| `POST` | `/api/translate` | ❌ | Batch translate ingredient text |
| `POST` | `/api/scan` | ❌ | Analyze food image via AI vision |
| `POST` | `/api/auth/sync` | ❌ | Sync Firebase user to MongoDB |
| `GET` | `/api/user/stats` | ✅ | Get daily macro stats + streak |
| `POST` | `/api/user/log_meal` | ✅ | Log a meal + estimate macros via AI |
| `GET` | `/api/user/profile` | ✅ | Get user health profile + settings |
| `POST` | `/api/user/profile` | ✅ | Save user health profile + settings |

---

## 🗃️ MongoDB Collections

### `users` collection
```json
{
  "uid": "firebase_uid",
  "email": "user@email.com",
  "name": "Display Name",
  "picture": "https://...",
  "last_login_date": "2026-07-30",
  "streak": 5,
  "stats": {
    "calories": 1200,
    "protein": 45,
    "carbs": 130,
    "fat": 40,
    "last_updated": "2026-07-30"
  },
  "health_profile": {
    "age": 25,
    "gender": "Male",
    "height": 175,
    "weight": 70
  },
  "preferences": {
    "diet": "None",
    "allergies": []
  },
  "settings": {
    "notificationsEnabled": true,
    "darkMode": true,
    "language": "English"
  }
}
```

### `foods` collection
```json
{
  "_id": "ObjectId",
  "name": "Paneer Butter Masala",
  "brand": "Homemade",
  "safety_score": 82,
  "status": "Safe",
  "ingredients": [
    { "name": "Paneer", "safety": "Safe", "description": "Fresh Indian cottage cheese" }
  ],
  "warnings": [],
  "source": "ai_fallback"  // optional — present for AI-generated entries
}
```

---

## 🛣️ Planned Features (Roadmap)

### 🔴 HIGH PRIORITY — Freemium Model
- [ ] MongoDB schema update (`tier`, `subscription`, `usage` fields on `users`)
- [ ] Razorpay subscription plans (₹366 / ₹732 / ₹998)
- [ ] `POST /api/subscription/create` + `GET /api/subscription/status`
- [ ] `POST /api/webhooks/razorpay` with HMAC verification
- [ ] Scan quota middleware (`check_scan_quota`)
- [ ] Tier-based AI routing (`ai_router.py`)
- [ ] Sarvam AI integration (`services/sarvam_client.py`)
- [ ] Frontend `PricingPage.tsx`
- [ ] Frontend `UpgradeModal.tsx` (triggered on quota limit)
- [ ] Frontend `UsageIndicator.tsx` (scan bar on Dashboard)
- [ ] Monthly scan counter reset (cron / scheduler)

### 🟡 MEDIUM PRIORITY
- [ ] **Smart Meal Planning** — Weekly meal plans + grocery lists
- [ ] **Dietary Restriction Filters** — Auto-flag Keto/Vegan/Halal/Gluten-Free conflicts
- [ ] **Advanced Analytics & Charts** — Macro trend graphs over weeks/months
- [ ] **Barcode Scanner** — Scan packaged food barcodes via open food database

### 🟢 FUTURE IDEAS
- [ ] **Wearable Integration** — Google Fit / Apple Health sync
- [ ] **Community Challenges** — Share meals, join health challenges
- [ ] **Voice Input** — Sarvam AI speech-to-text for hands-free food logging (Elite tier)
- [ ] **Explain Briefly** — AI explains what each ingredient does (Options modal stub)
- [ ] **Manufacturer Details** — Show brand/manufacturer info (Options modal stub)
- [ ] **Suggest From This Brand** — Recommend healthier alternatives from same brand

---

## ⚙️ Environment Variables Required

### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=...
NVIDIA_API_KEY=...
NVIDIA_API_KEY_1=...
NVIDIA_API_KEY_2=...
NVIDIA_API_KEY_3=...
NVIDIA_API_KEY_4=...
NVIDIA_API_KEY_5=...
NVIDIA_VISION_MODEL=meta/llama-3.2-11b-vision-instruct
NVIDIA_TEXT_MODEL=meta/llama-3.1-8b-instruct
FIREBASE_CREDENTIALS={"type":"service_account",...}
# --- PLANNED (Freemium) ---
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_ID_STARTER=
RAZORPAY_PLAN_ID_PRO=
RAZORPAY_PLAN_ID_ELITE=
SARVAM_API_KEY=
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
# --- PLANNED (Freemium) ---
VITE_RAZORPAY_KEY_ID=
```

---

## 🐛 Known Issues / Technical Debt

| Issue | Severity | File | Notes |
|---|---|---|---|
| `alert()` still used in `UserStatsContext.tsx` (single meal log) | Low | `UserStatsContext.tsx` | Replace with toast in future cleanup |
| No loading state on batch meal log (Tick button) | Low | `Search.tsx` | Spinner shows but no per-item progress |
| `main.py` is a monolith (830+ lines) | Medium | `backend/main.py` | Should be split into `routes/` when Freemium is built |
| No unit tests anywhere | Medium | Entire project | Add pytest (backend) + Vitest (frontend) in future |
| Notifications scheduled with `setTimeout` (not persistent) | Low | `UserStatsContext.tsx` | Use a proper push notification service eventually |

---

## 📝 Update Checklist (Run After Every Session)

After completing any work, update this file with:
- [ ] New "Last Session Summary" block at the top
- [ ] Move any completed items from "Planned" to "Completed"
- [ ] Update "Last Modified" dates in Key Files Reference
- [ ] Add any new API endpoints to the reference table
- [ ] Update MongoDB schema if new fields were added
- [ ] Add any new known issues discovered
- [ ] Update "Currently Active" table
