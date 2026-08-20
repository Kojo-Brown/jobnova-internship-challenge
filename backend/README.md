# Indeed Auto-Apply Module

A small, reusable backend module implementing a minimal end-to-end Indeed
auto-apply workflow: secure session persistence, pause/resume around manual
verification, and per-application status tracking. Deliberately **not** a
production system — see "Extending to multiple users" for how it would grow.

> ⚠️ **Rules of engagement** (enforced by design): use only your own Indeed
> account and personal profile, apply only to roles relevant to your
> background, and **never bypass** CAPTCHA, SMS, email verification or any
> other platform security mechanism. This module *detects* those checks and
> hands control back to you.

## Quick start

```bash
npm install
npx playwright install chromium

cp .env.example .env                   # then set SESSION_ENC_KEY (see file)
cp profile.example.json profile.json   # fill in YOUR OWN details + resume path

npm run cli -- login      # headed browser opens; log in manually (incl. any 2FA)
npm run cli -- discover   # find a few suitable "Easily apply" jobs -> pending
npm run cli -- apply      # run the workflow end-to-end
npm run cli -- status     # see: pending / in_progress / submitted / failed / manual_action_required
npm run cli -- resume     # after clearing a manual check, continue paused applications
```

HTTP API (same operations, machine-friendly): `npm run serve` →
`GET /health`, `GET /session`, `GET /applications`,
`POST /workflow/discover`, `POST /workflow/run`, `POST /workflow/resume`,
`POST /applications/:id/retry`.

## Overall architecture

```
             ┌────────────────────────────────────────────────┐
             │                 ApplyWorkflow                  │
             │  orchestration + pause/resume + status updates │
             └───────┬──────────────┬──────────────┬──────────┘
                     │              │              │
        ┌────────────▼───┐   ┌──────▼───────┐  ┌───▼──────────────┐
        │ BrowserSession │   │ IndeedClient │  │ ApplicationStore │
        │ short-lived    │   │ page-level   │  │ status + events  │
        │ Chromium ctx   │   │ ops (search, │  │ state machine    │
        └───────┬────────┘   │ apply, chal- │  └───┬──────────────┘
                │            │ lenge detect)│      │
        ┌───────▼────────┐   └──────────────┘  ┌───▼──────────┐
        │  SessionStore  │                     │  JsonStore   │
        │ AES-256-GCM    │                     │ atomic JSON  │
        │ storage state  │                     │ file writes  │
        └────────────────┘                     └──────────────┘
```

- **`ApplyWorkflow`** (`src/workflow/ApplyWorkflow.ts`) — the use-cases:
  `interactiveLogin()`, `discoverJobs()`, `run()`, `resume()`, `retry()`.
- **`IndeedClient`** (`src/indeed/IndeedClient.ts`) — all Indeed page
  interaction: login detection, job search (restricted to "Easily apply"
  postings), the multi-step apply wizard, and challenge detection.
- **`BrowserSession`** (`src/browser/BrowserSession.ts`) — a short-lived
  Chromium context that is rehydrated from the stored session on `open()` and
  captured back on `close()`.
- **`SessionStore`** (`src/session/SessionStore.ts`) — encrypted persistence of
  Playwright storage state, one blob per user.
- **`ApplicationStore`** (`src/storage/ApplicationStore.ts`) — one record per
  (user, job) with a full status event log, guarded by an explicit state
  machine (`src/workflow/stateMachine.ts`).
- Interfaces: a CLI (`src/cli.ts`) and a small Express API (`src/api/server.ts`).
  Both are thin wrappers over `ApplyWorkflow`.

## How the browser session is stored and restored

The requirement is *remote session management without keeping a browser
running*. The module never keeps a long-lived browser:

1. After any authenticated activity, `BrowserSession.persist()` calls
   Playwright's `context.storageState()` — capturing Indeed's cookies (the CTK
   session cookie etc.) and localStorage.
2. That JSON is encrypted with **AES-256-GCM** (12-byte random IV + 16-byte
   auth tag, key from `SESSION_ENC_KEY`, 32 bytes hex) and written atomically
   (`*.tmp` + `rename`) to `data/sessions/<user>.session.enc`. Nothing
   readable is ever on disk; tampering fails authentication on decrypt.
3. The next run — minutes or days later, on any machine holding the key —
   creates a fresh Chromium context with `storageState` rehydrated from that
   blob. If Indeed still honours the cookies, the user is logged in with no
   interaction; if the session has expired, the workflow pauses with
   `manual_action_required (login_required)` instead of trying to automate
   credentials.

The state is also re-persisted between individual applications, so a crash
mid-run loses nothing.

## How manual verification and failures are handled

**Verification (never bypassed).** Before and during every apply step,
`IndeedClient.detectChallenge()` looks for hCaptcha/reCAPTCHA iframes, OTP
inputs, email-verification walls and interstitial pages. On detection the
workflow:

1. transitions the application to **`manual_action_required`** with the
   challenge kind (`captcha` / `sms_code` / `email_verification` /
   `login_required` / `unknown_challenge`) and a **checkpoint** (e.g.
   `apply_step_3`) recorded in the event log,
2. persists the browser session and closes the browser,
3. stops processing further jobs if the challenge gates the whole session
   (CAPTCHA / login).

The operator then runs `npm run cli -- login` — a **headed** browser where
they complete the check by hand (enter the SMS code, click the email link,
solve the CAPTCHA). Once login is confirmed the refreshed session is saved,
and `npm run cli -- resume` re-runs every paused application from its
checkpoint state. Screener questions the profile has no confident answer for
are treated the same way: pause, ask the human, resume — never guess.

**Failures.** Any unexpected error, a posting without "Easily apply", or a
stalled wizard transitions the record to **`failed`** with the reason in the
event log. `failed → pending` is an explicit, operator-triggered retry
(`retry <id>`), so the workflow never loops on a broken posting. Every status
change is appended to the record's `events` array, giving a full audit trail:

```
pending → in_progress → manual_action_required(captcha @ apply_step_2)
        → in_progress → submitted
```

## How this could support multiple users

The storage layer is already user-scoped — sessions are one encrypted blob per
user, and application records carry a `user` field (deduplication is per
user + job). To grow beyond single-user:

1. **Profile registry.** Replace the single `profile.json` with per-user
   profiles in a database; add `user` parameters to the API routes (or derive
   the user from auth).
2. **Key management.** Move from one `SESSION_ENC_KEY` to per-user data keys
   wrapped by a KMS/HSM master key, so one leaked key never exposes every
   session.
3. **Job queue.** Swap the in-process loop for a proper queue (BullMQ,
   SQS, …) with one worker per user session; the state machine already makes
   each application an independent, resumable unit. Concurrency per user stays
   at 1 (one Indeed session), while users scale horizontally across workers.
4. **Storage.** `JsonStore` is an interface-compatible seam — replace with
   Postgres/SQLite repositories without touching workflow code.
5. **Manual-action inbox.** Surface `manual_action_required` records in a UI
   (webhook/notification per user) so each user can clear their own
   challenges; `resume` is already idempotent and per-user.

## Development

```bash
npm run typecheck
npm test          # 22 unit tests: crypto, session store, state machine, application store
npm run build
```

Unit tests intentionally cover the deterministic core (crypto round-trips,
tamper detection, path-traversal-safe session files, state-machine legality,
atomic/concurrent store updates) and **not** live Indeed calls — CI must not
depend on, or hammer, a third-party site.
