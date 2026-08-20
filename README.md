# JobNova Internship Challenge

Submission for the JobNova *Software Engineer intern (AI application)* take-home
challenge. Built with spec-driven development — see [SPEC.md](SPEC.md) for the
requirement matrix.

## Repository layout

```
frontend/   Job board with recommendation page (Figma design) — Vite + React + TS + Tailwind
backend/    Minimal Indeed auto-apply workflow module — Node + TS + Playwright
.github/    CI/CD — lint, typecheck, tests, builds + GitHub Pages deploy
SPEC.md     Requirement matrix and verification plan
```

## Part 1 — Frontend (job board + recommendations)

Implements the Figma design (`web-development-test`): jobs list with match-score
cards, AI mock-interview rail, full job-detail page with the "Why is this job a
good fit for me?" panel (including the locked free-plan variant), plus a
responsive mobile H5 layout and extra interactions (search, like/apply
persistence, animated match rings, toasts, skeletons).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build      # production build
```

Live demo: deployed to GitHub Pages by CI on every push to `main`.

## Part 2 — Backend (Indeed auto-apply module)

A small, reusable module that saves/restores an Indeed login session securely
(encrypted Playwright storage state), pauses for any manual verification
(SMS / email / CAPTCHA — never bypassed), applies to a small set of suitable
jobs with your own profile, and records per-application status
(`pending` → `in_progress` → `submitted` / `failed` / `manual_action_required`).

See [backend/README.md](backend/README.md) for architecture, session storage
details, manual-verification handling, and the multi-user extension plan.

```bash
cd backend
npm install
cp .env.example .env          # set SESSION_ENC_KEY
cp profile.example.json profile.json   # fill in your own details
npm run cli -- login          # capture session (headed browser, manual login)
npm run cli -- apply          # run the auto-apply workflow
npm run cli -- status         # application statuses
npm run serve                 # HTTP API on :4000
```

> ⚠️ Uses only your own personal account and profile. Verification challenges
> are detected and left for you to complete manually — nothing is bypassed.

## CI/CD

GitHub Actions ([ci.yml](.github/workflows/ci.yml)):

- **frontend** — lint, typecheck, unit tests, production build
- **backend** — typecheck, unit tests, build
- **deploy** — publishes `frontend/dist` to GitHub Pages on `main`
