# EduCompare – Feature Roadmap

A living checklist of high‑impact features to bring EduCompare to parity with leading college discovery apps.

## Core Discovery
- [ ] Rich college profiles: photos/video gallery, departments, course‑wise fees/eligibility, campus life, recruiters
- [ ] Placements section: year‑over‑year stats (mean/median CTC), top recruiters, internship stats, charts
- [ ] Cutoffs & seat matrix: year/round/exam/category, branch‑wise closing rank; filters + CSV export
- [ ] Admissions timeline: intake windows, forms, counselling rounds; “Admission Alerts” toggle per college
- [ ] Rankings & curated lists: NIRF/state rankings; lists like “Top ROI Colleges”, “Best in Delhi”

## Utilities / Tools
- [ ] College/branch predictor (rule‑based): input rank/percentile + category → predicted colleges/branches
- [ ] Fees/ROI calculator: total cost vs. expected CTC, payback visualization
- [ ] Deep compare: table view across fees, cutoffs, placements (mean/median), intake, ranking, accreditation, hostel fees

## Social Proof & Community
- [ ] Student reviews: ratings by category (Academics, Placements, Infra, Faculty), pros/cons, verified flag, helpful votes
- [ ] Q&A (Ask a question): threaded questions per college; expert/mentor answers; reply notifications
- [ ] Alumni stories: short testimonials and outcomes

## Exams & Scholarships
- [ ] Exam hubs: dates, pattern, eligibility, syllabus, application steps, prep tips; reminders
- [ ] Scholarship finder: filters (merit/need/state/private), eligibility wizard, apply links; tie to colleges
- [ ] Calendar view: consolidated upcoming exams/admissions; export ICS; reminders (push)

## Search & Personalization
- [ ] Advanced filters: mode (Full/Part/Distance), ownership (Govt/Private/Deemed), accreditation (NAAC/NBA), hostel availability/fees, intake, placement ≥ X%
- [ ] Map / “Near me”: map view + distance filter; location permission gate
- [ ] Saved searches + alerts: persist queries/filters; push/email when new matches/cutoffs or forms open

## Content & Media
- [ ] News/updates feed: college and exam news; follow colleges/exams; notifications
- [ ] Brochures & documents: PDF previews and downloads (brochure, syllabus)

## Accounts & Onboarding
- [ ] Profile strength checklist: guide users to add scores/exams/preferences
- [ ] Multi‑auth: Google/Apple; OTP login (optional, market‑dependent)

## Monetization / BD (optional)
- [ ] Lead forms: “Apply/Enquire” per college; webhook to CRM
- [ ] Sponsored placements: labelled promoted cards in results

---

# Engineering Plan

## Backend (FastAPI + MongoDB)
- [ ] Model additions:
  - `colleges`: gallery, departments, course_fees[], placement_stats[], hostel_fees, accreditation[]
  - `cutoffs`: year, round, exam, category, branch, closing_rank/percentile
  - `seats`: college_id, year, branch, category, intake
  - `reviews`, `questions`, `answers`, `news`, `exams`, `scholarships`, `saved_searches`
- [ ] Indexes: text(name), (city,state), ranking, star_rating, annual_fees; compound on (cutoffs.year, exam, category, branch)
- [ ] Rate limiting for search/autocomplete; CORS tighten for prod
- [ ] Media: move base64 to URL storage (S3/Cloud) + CDN; thumbnail sizes
- [ ] API docs: ensure FastAPI `/docs` + tag endpoints; sample requests

## Frontend (Expo + TypeScript)
- [ ] College detail tabs: Overview, Courses/Fees, Cutoffs, Placements, Reviews, Gallery
- [ ] Compare table view with sticky headers and horizontal scroll
- [ ] Reviews/Q&A UIs with post flows (login‑gated)
- [ ] Exam/Scholarship detail pages + “Add to calendar” (ICS) and reminders
- [ ] Advanced filters panel (ownership/accreditation/mode/hostel/intake/placement)
- [ ] Map view (optional phase) with distance filter
- [ ] Saved search CTA + Alerts toggle on search header
- [ ] Image caching + memoization; avoid inline base64 in lists

## Infra / DevEx
- [ ] Docker Compose: Mongo + backend with health checks
- [ ] CI: ESLint, TypeScript, Flake8, backend tests
- [ ] Telemetry: crash reporting + minimal analytics (screen views, search, save/compare)
- [ ] Docs: update README to MongoDB (envs, indexes), add `.env.example` for FE/BE

---

# Milestones (Suggested)

## Phase 1 (Discovery foundations)
- [ ] Deep college profiles (Overview, Courses/Fees, Placements, Gallery)
- [ ] Advanced filters (ownership, accreditation, hostel, intake)
- [ ] Compare table v1

## Phase 2 (Proof & data depth)
- [ ] Reviews + Q&A
- [ ] Cutoffs + seat matrix
- [ ] Exam hubs + reminders

## Phase 3 (Personalization & growth)
- [ ] Saved searches + alerts
- [ ] Scholarship finder
- [ ] News/updates feed

---

# Acceptance Criteria (Samples)
- Rich profiles: each tab loads under 200ms after data cached; image LCP < 2.5s
- Compare: sticky headers on iOS/Android; horizontal scroll with 60 FPS
- Cutoffs: filter by year/exam/category/round; export CSV; empty states handled
- Reviews: report/flag flow; helpful vote debounce and persistence
- Alerts: user can save a search and receive a push when criteria matches

> This file is meant to evolve. Edit as features ship or priorities change.
