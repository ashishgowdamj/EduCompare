# EduCompare Product Overview

![EduCompare splash](../frontend/assets/images/app-image.png)

## What EduCompare Does
EduCompare is a mobile-first college discovery companion built with Expo Router and FastAPI. Students can search thousands of Indian colleges, personalize results around their goals, and track the application journey end-to-end. The app ships as an Expo project (`frontend/`) that talks to a FastAPI + MongoDB backend (`backend/`). Local device storage (AsyncStorage) keeps users signed in, remembers preferences, and caches lightweight analytics.

## High-Level Architecture
- **Frontend**: React Native + Expo Router, Space Grotesk typography, context providers for auth, favorites, compare, and preferences. Home feed is powered by a FlashList with lazy loading, skeleton states, and animated shimmer placeholders.
- **Backend**: FastAPI service in `backend/server.py` with MongoDB models for colleges, reviews, cutoffs, seats, news, etc. RecommendationEngine powers personalized suggestions. REST endpoints under `/api` drive search, detail pages, favorites, compare lists, reviews, lead capture, and CSV downloads.
- **Configuration**: Expo pulls the backend URL from `EXPO_PUBLIC_BACKEND_URL` or infers it from the Expo host. Backend uses `.env` (`MONGO_URL`, `DB_NAME`). Import scripts in `backend/scripts/` seed colleges and enrich data.

## Core User Journey
1. **Splash & Routing** – Users hit the refreshed gradient splash (`app-image.png`) featuring the EduCompare badge and tagline "Discover. Compare. Decide.", then the root loader (`app/index.tsx`) checks AsyncStorage for auth state and first-run flag before routing to onboarding or the main tabs.
2. **Onboarding (`app/onboarding.tsx`)** – Animated carousel introduces discovery, comparison, and favorites. Users can sign up, sign in, or continue as guest. Credentials are mocked and stored locally.
3. **Preference Setup (`app/preferences-setup.tsx`)** – Multi-step wizard captures courses, budget, states/cities, preferred college types, and entrance exams. Preferences seed search filters and recommendation weights.
4. **Home Search Tab (`app/(tabs)/home.tsx`)** – Sticky gradient header, typeahead smart search with merged local and server suggestions, category pills, deep filter modal, and FlashList of college cards. Users can favorite, queue for comparison, or jump into details. Quick tiles lead to Compare, Favorites, Exams, Scholarships.
5. **College Details (`app/college/[id].tsx`)** – Rich profile tabs: overview, placements, cutoffs (with filters), seat matrix, reviews with post modal, gallery, recruiters, admissions info, and lead capture drawer. Interacts with favorites, compare list, and preference history.
6. **Compare Tab (`app/(tabs)/compare.tsx`)** – Horizontal cards plus metrics grid comparing ranking, fees, placement %, packages, establishment year, facilities, etc. Users can remove items or clear the slate.
7. **Favorites Tab (`app/(tabs)/favorites.tsx`)** – Saved colleges grouped with filters. Drives the deadline tracker and notifications.
8. **Profile Tab (`app/(tabs)/profile.tsx`)** – Account info, application progress, browsing history, preferences shortcut, and sign-out.

## Discovery & Productivity Modules
- **Filter Modal (`components/FilterModal.tsx`)** – Quick chips for government/private, top rankings, fee caps, city/state defaults, facility toggles, placement/CTC thresholds, and accreditation chips. Persisted in screen state.
- **Smart Quick Actions / Recommendations** – Personalized shortcuts (`SmartQuickActions.tsx`) and recommendation rail (`RecommendationsSection.tsx`) that reflect preferences and browsing history.
- **Deadline Tracker (`components/DeadlineTracker.tsx`)** – Generates application, exam, and scholarship reminders for favorited colleges; persisted in AsyncStorage with completion state.
- **Application Progress (`components/ApplicationProgress.tsx`)** – Gamified checklist across shortlist, applications, documents, exams, scholarships, and final decisions.
- **Updates Feed (`components/UpdatesFeed.tsx`)** – Mock news cards that would be hydrated from `/api/news` in production.

## Notifications & Activity
- **Push** – Expo Notifications integration registers for push tokens (when available) and stores a local inbox in AsyncStorage. Badge counts bubble up to the home header.
- **Recent Searches & Suggestions** – Search box stores the last eight queries locally and merges with popular keywords before hitting `/api/colleges/search` for live suggestions.
- **Browsing History** – Preferences context records every college view/favorite/compare action with timestamp/duration for future analytics and better recommendations.

## Backend APIs at a Glance
- `GET /api/colleges/search` – Keyword search with pagination, filters (fees, ranking, facilities, accreditation, placement), and sorting (relevance, ranking, fee low/high, rating).
- `GET /api/colleges/{id}` – Full college profile including placement stats, recruiters, gallery, departments, and campus life.
- `GET /api/cutoffs`, `/api/cutoffs/options`, `GET /api/seats` – Drive the detail screen tables with year/exam/category filters.
- `POST /api/reviews`, `/api/reviews/{id}/helpful`, etc. – Community features (review submission, helpful votes, moderation flags).
- `POST /api/favorites`, `/api/compare` – Persisted lists for authenticated users (mocked locally in the current build).
- CSV/JSON helpers – `/api/colleges/export`, `/api/colleges/summary` support data export and dashboards.

## Data Workflows & Tooling
- `backend/scripts/import_colleges.py` ingests CSV data, cleanses it, and enriches missing logos from URLs.
- RecommendationEngine pairs preference weights with historical engagement to rank results.
- Docker/CI plans are captured in `docs/FEATURES.md` for future infra hardening.

## Running the Stack Locally
1. **Backend** – Create a `.env` in `backend/` (sample in comments), install deps (`pip install -r requirements.txt`), then `uvicorn server:app --reload`.
2. **Frontend** – Copy `frontend/.env.example` to `.env` (or set `EXPO_PUBLIC_BACKEND_URL`), run `npm install`, then `npx expo start`.
3. **Testing** – Backend tests live in `tests/` with `pytest`. Frontend relies on manual/Expo testing; linting via `npm run lint`.

## Roadmap
`docs/FEATURES.md` tracks the product backlog: deeper college content, placement analytics, predictor tools, community reviews/Q&A, alerts, scholarships, maps, monetization, and infra tasks like Docker, CI, and telemetry. Use it to prioritize upcoming releases.
