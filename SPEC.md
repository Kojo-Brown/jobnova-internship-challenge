# JobNova Internship Challenge — Specification

Spec-driven development document. Every requirement below is traced to an
implementation task and verified before completion.

Source: *Software Engineer intern (AI application) — take-home challenge* (see
`docs/` and the challenge document). Two parts, both required.

---

## Part 1 — Frontend: Job board with recommendation page

**Source of truth:** Figma file `web-development-test`
(`BToXxGpLyklQQoBKb3c3yx`), pages `Home page/Jobs 30` (list),
`Home page/Jobs 21` (job detail), `Home page/Jobs 29` (liked state),
locked fit-panel variant (`Upgrade to check`), single job-card component.

### Functional requirements

| ID | Requirement | Status |
|----|-------------|--------|
| F1 | Top navigation: JobNova logo, tabs **Matched / Liked (count) / Applied (count)** | ✅ |
| F2 | Left sidebar: Jobs, AI Mock Interview, Resume ▪ Profile, Setting ▪ Subscription, Extra Credits + **Upgrade Your Plan** gradient card | ✅ |
| F3 | Jobs list: gradient **Change Job Reference** button + **Top matched** button | ✅ |
| F4 | Job cards: circular match gauge (color-coded %), title, company + logo, location • On-site/Remote, tag row (type, exp, level, salary), footer (posted ago, applicants, **Apply**, **Mock Interview**), link + heart actions | ✅ |
| F5 | Right rail: "Ace Your Interviews with AI-Powered Mock Sessions!" promo card with Why-choose sections and **Mock Interview** CTA | ✅ |
| F6 | Job detail page: back, applicants pill, external link, heart, **Apply Now**; header (logo, posted, title, company, location • ago • remote, match ring); meta grid (country, exp, type, salary, workplace, level); description | ✅ |
| F7 | Detail: lime **Maximize your interview success** panel (3 columns + Start Interview) | ✅ |
| F8 | Detail sections: Qualification (skill tags), Required, Preferred, Responsibilities, Benefits, Company card | ✅ |
| F9 | Detail right rail: **Why is this job a good fit for me?** — 4 stat rings (Education, Work Exp, Skills, Exp. Level) + Relevant Experience / Seniority / Education notes; **locked variant** with blurred content + "Upgrade to check" (free-plan state) | ✅ |
| F10 | Tabs work: Matched lists recommendations; Liked / Applied filter accordingly with live badge counts | ✅ |
| F11 | Responsive mobile H5 view (no Figma design — own best practice): collapsible drawer nav, single column, bottom action bar | ✅ |
| F12 | Extra JS interactions beyond the design (see below) | ✅ |

### Extra interactions (F12, our own additions)

- Animated match rings (SVG stroke animation on mount / when visible)
- Client-side search + work-mode filter for job list
- Like/save with heart micro-animation, persisted to `localStorage`
- Apply flow: confirmation → applied state persisted, toast notifications
- Skeleton loading state on first load (simulated fetch)
- Sticky headers, smooth scroll-to-top on tab/page change
- Empty states for Liked / Applied tabs
- Keyboard accessibility (tab focus, Enter/Space activation, aria labels)

### Non-functional

- Stack: Vite + React 18 + TypeScript + Tailwind CSS v4
- Unit tests: Vitest + React Testing Library
- Lint: ESLint (typescript-eslint); type-check must pass
- Deployable as static site (GitHub Pages via CI)

---

## Part 2 — Backend: Indeed auto-apply workflow

A small, reusable backend module (explicitly **not** production-ready) that
implements a minimal end-to-end Indeed auto-apply workflow.

### Functional requirements

| ID | Requirement | Status |
|----|-------------|--------|
| B1 | Account: use candidate's own Indeed account (created manually with own email/phone; manual verification) | ✅ (operator step, documented) |
| B2 | Candidate profile: own resume, contact info, work experience, education, preferences — configurable `profile.json` | ✅ |
| B3 | **Remote session management**: securely save & restore the Indeed login session without keeping a browser running (encrypted Playwright `storageState`, AES-256-GCM at rest) | ✅ |
| B4 | **Pause / resume** when manual verification is required (SMS code, email verification, CAPTCHA). Never bypass checks — detect, persist a checkpoint, mark `manual_action_required`, resume after operator completes it | ✅ |
| B5 | Select a small number of suitable jobs and complete the Indeed application flow with the profile | ✅ |
| B6 | Record per-application status: `pending`, `in_progress`, `submitted`, `failed`, `manual_action_required` (+ event log) | ✅ |
| B7 | README: architecture, session storage/restore, manual verification & failure handling, multi-user extension | ✅ |

### Design constraints

- Node.js + TypeScript + Playwright (Chromium)
- No CAPTCHA/verification bypass of any kind — detection pauses the workflow
- Storage: JSON file stores with atomic writes (zero native deps; swap-in SQLite/Postgres documented)
- Interfaces: CLI (`login`, `apply`, `resume`, `status`, `list`) and a small Express HTTP API
- Unit tests cover: crypto round-trip, session store, application state machine, status transitions (no live Indeed calls in CI)

---

## Part 3 — CI/CD

| ID | Requirement | Status |
|----|-------------|--------|
| C1 | GitHub Actions CI: frontend lint + typecheck + test + build; backend typecheck + test + build; runs on push/PR | ✅ |
| C2 | CD: deploy frontend to GitHub Pages on push to `main` | ✅ |
| C3 | Commits pushed in small, feature-scoped increments | ✅ |

---

## Verification plan

1. **Pass 1 review:** run lint, typecheck, unit tests, production builds for both
   packages; manually exercise the frontend routes and backend CLI happy path.
2. **Pass 2 review:** independent code review sweep for correctness bugs, edge
   cases (empty states, persistence corruption, resume-after-crash), and design
   fidelity against the Figma captures; fix everything found.
