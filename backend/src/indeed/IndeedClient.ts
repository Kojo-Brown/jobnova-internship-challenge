import type { Locator, Page } from 'playwright'
import type { JobPosting, ManualActionKind, Profile } from '../types.js'

export type ChallengeCheck = { kind: ManualActionKind; description: string } | null

export interface SearchResult {
  jobs: JobPosting[]
  /** Set when a verification wall interrupted the search. */
  challenge: ChallengeCheck
}

export type ApplyResult =
  | { outcome: 'submitted' }
  | { outcome: 'manual'; kind: ManualActionKind; checkpoint: string; description: string }
  | { outcome: 'failed'; reason: string }

const BASE = 'https://www.indeed.com'

/**
 * Page-level operations against Indeed. Kept deliberately small: search,
 * login detection, challenge detection and the "Easily apply" flow.
 *
 * IMPORTANT: challenges (CAPTCHA / SMS / email verification) are only
 * *detected* here — never bypassed. Detection pauses the workflow so a human
 * can complete the check in a headed browser.
 */
export class IndeedClient {
  constructor(private page: Page) {}

  /**
   * The first VISIBLE match for a locator. Indeed renders several hidden
   * responsive/experiment variants of the same control (e.g. five "Continue"
   * buttons where only one is displayed), so `.first()` in DOM order easily
   * lands on a hidden node and every wait then times out.
   */
  private visible(locator: Locator): Locator {
    return locator.filter({ visible: true }).first()
  }

  /**
   * Wait up to `timeout` ms for any match to become visible.
   * (`isVisible({timeout})` does NOT wait in Playwright — its timeout option
   * is deprecated and ignored, so we use waitFor instead.)
   */
  private async waitVisible(locator: Locator, timeout: number): Promise<boolean> {
    return this.visible(locator)
      .waitFor({ state: 'visible', timeout })
      .then(() => true)
      .catch(() => false)
  }

  /**
   * Detect verification walls. Order matters: a CAPTCHA page may also contain
   * the word "verification" in copy, so check the most specific signals first.
   */
  async detectChallenge(): Promise<ChallengeCheck> {
    const url = this.page.url()
    const title = (await this.page.title().catch(() => '')).toLowerCase()

    const selectors: Array<{ sel: string; kind: ManualActionKind; description: string }> = [
      { sel: 'iframe[src*="hcaptcha"], iframe[src*="recaptcha"], iframe[title*="captcha" i], #captcha-challenge', kind: 'captcha', description: 'CAPTCHA challenge shown' },
      { sel: 'input[autocomplete="one-time-code"], input[name*="otp" i], input[aria-label*="verification code" i]', kind: 'sms_code', description: 'One-time verification code requested' },
      { sel: 'text=/verify your email/i', kind: 'email_verification', description: 'Email verification required' },
    ]
    for (const { sel, kind, description } of selectors) {
      if (await this.waitVisible(this.page.locator(sel), 500)) return { kind, description }
    }

    if (/additional verification|are you a human|hold on|just a moment/i.test(title) || /\/challenge|\/blocked/i.test(url)) {
      return { kind: 'unknown_challenge', description: `Verification interstitial at ${url}` }
    }
    return null
  }

  /** Heuristic: the account menu only renders when authenticated. */
  async isLoggedIn(): Promise<boolean> {
    await this.page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' })
    const accountButton = this.page.locator(
      '[data-gnav-element-name="AccountMenu"], a[href*="myaccount"], button[aria-label*="account" i]',
    )
    return this.waitVisible(accountButton, 6000)
  }

  async gotoLogin(): Promise<void> {
    await this.page.goto('https://secure.indeed.com/account/login', { waitUntil: 'domcontentloaded' })
  }

  /**
   * Search and collect a small number of job cards relevant to the profile.
   * Only "Easily apply" postings are returned — external ATS sites are out of
   * scope for the minimal module. A verification wall aborts the search and is
   * reported to the caller instead of being silently swallowed.
   */
  async searchJobs(profile: Profile, limit: number): Promise<SearchResult> {
    const results: JobPosting[] = []
    const seen = new Set<string>()

    for (const query of profile.jobPreferences.queries) {
      if (results.length >= limit) break
      const params = new URLSearchParams({ q: query, l: profile.jobPreferences.location, sc: '0kf:attr(DSQF7);' })
      await this.page.goto(`${BASE}/jobs?${params}`, { waitUntil: 'domcontentloaded' })
      const challenge = await this.detectChallenge()
      if (challenge) return { jobs: results, challenge }

      const cards = this.page.locator('[data-testid="slider_item"], .job_seen_beacon')
      await this.waitVisible(cards, 8000)
      const count = Math.min(await cards.count().catch(() => 0), 15)

      for (let i = 0; i < count && results.length < limit; i++) {
        const card = cards.nth(i)
        const link = card.locator('a[href*="/rc/clk"], a[href*="jk="], h2 a').first()
        const href = (await link.getAttribute('href').catch(() => null)) ?? ''
        const jobKey = href.match(/jk=([a-f0-9]+)/i)?.[1]
        if (!jobKey || seen.has(jobKey)) continue

        const title = (await link.innerText().catch(() => '')).trim()
        const company = (
          await card
            .locator('[data-testid="company-name"], .companyName')
            .first()
            .innerText()
            .catch(() => 'Unknown')
        ).trim()

        const lowerTitle = title.toLowerCase()
        if (profile.jobPreferences.excludeKeywords.some((k) => lowerTitle.includes(k.toLowerCase()))) continue

        seen.add(jobKey)
        results.push({ jobKey, title, company, url: `${BASE}/viewjob?jk=${jobKey}` })
      }
    }
    return { jobs: results, challenge: null }
  }

  /**
   * Drive the Indeed "Easily apply" flow for one job, filling contact fields
   * and screener questions from the profile. Returns a checkpoint whenever a
   * human is needed.
   */
  async apply(job: JobPosting, profile: Profile): Promise<ApplyResult> {
    const originalPage = this.page
    let popup: Page | null = null
    try {
      return await this.applyInner(job, profile, (p) => {
        popup = p
      })
    } finally {
      // Session state lives in cookies, so the wizard tab can be closed safely.
      if (popup) await (popup as Page).close().catch(() => undefined)
      this.page = originalPage
    }
  }

  private async applyInner(job: JobPosting, profile: Profile, onPopup: (p: Page) => void): Promise<ApplyResult> {
    await this.page.goto(job.url, { waitUntil: 'domcontentloaded' })

    let challenge = await this.detectChallenge()
    if (challenge) return { outcome: 'manual', kind: challenge.kind, checkpoint: 'view_job', description: challenge.description }

    // Indeed A/B-tests this button: id, testid and label all vary.
    const applyButton = this.page.locator(
      '[data-testid="indeedApplyButton-test"], #indeedApplyButton, ' +
        'button:has-text("Apply with Indeed"), button:has-text("Easily apply"), button:has-text("Apply now")',
    )
    if (!(await this.waitVisible(applyButton, 8000))) {
      return { outcome: 'failed', reason: 'No Easily apply button on this posting (external ATS?)' }
    }

    // Let React hydrate — a click before the handler attaches is a silent
    // no-op — then click with retries. The wizard (smartapply.indeed.com)
    // opens either in a popup tab or in-place.
    await this.page.waitForTimeout(2500)
    let popup: Page | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      const popupPromise = this.page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null)
      await this.visible(applyButton).click().catch(() => undefined)
      popup = await popupPromise
      if (popup) break
      await this.page.waitForTimeout(2000)
      if (/smartapply/i.test(this.page.url())) break
    }
    if (popup) {
      onPopup(popup)
      this.page = popup
    } else if (!/smartapply/i.test(this.page.url())) {
      return { outcome: 'failed', reason: 'Apply wizard did not open after 3 click attempts' }
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined)

    // The apply wizard is a multi-step form; walk up to 12 steps.
    for (let step = 0; step < 12; step++) {
      // each wizard step fetches its content client-side — give it room
      await this.page.waitForTimeout(2500)

      challenge = await this.detectChallenge()
      if (challenge) {
        return { outcome: 'manual', kind: challenge.kind, checkpoint: `apply_step_${step}`, description: challenge.description }
      }

      // Resume-selection step: the uploaded file resume is preselected by
      // default; if nothing is selected, pick the file resume card (never the
      // AI-tailored beta card — it needs human review).
      if (/resume-selection/i.test(this.page.url())) {
        const checked = await this.page
          .locator('input[name="resume-selection"]:checked')
          .count()
          .catch(() => 0)
        if (checked === 0) {
          const fileCard = this.page.locator(
            '[data-testid="resume-selection-file-resume-radio-card-button"], [data-testid="FileResumeCard-input"]',
          )
          if (await this.waitVisible(fileCard, 3000)) await this.visible(fileCard).click().catch(() => undefined)
        }
      }

      await this.fillKnownFields(profile)

      // Terminal state? Match explicit confirmation copy only — a bare
      // "applied" appears in nav items and must not count as success.
      const done = this.page.locator(
        '[data-testid*="success" i], text=/application (has been )?submitted|successfully applied/i',
      )
      if (await this.waitVisible(done, 500)) {
        return { outcome: 'submitted' }
      }

      const submit = this.page.locator(
        'button:has-text("Submit your application"), button:has-text("Submit application"), button[data-testid*="submit" i]',
      )
      // the review-module page renders slowly and offers ONLY this button
      const submitWait = /review/i.test(this.page.url()) ? 10_000 : 1500
      if (await this.waitVisible(submit, submitWait)) {
        await this.visible(submit).click()
        await this.page.waitForTimeout(2500)
        challenge = await this.detectChallenge()
        if (challenge) {
          return { outcome: 'manual', kind: challenge.kind, checkpoint: 'submit', description: challenge.description }
        }
        return { outcome: 'submitted' }
      }

      // Sub-forms (e.g. resume-module education edits) use Save-style
      // buttons. ":text-is" keeps "Save" exact so "Save and close" (the
      // wizard EXIT button) can never match.
      const cont = this.page.locator(
        'button[data-testid="continue-button"], button:has-text("Save and continue"), ' +
          'button:text-is("Save"), button:has-text("Continue"), button:has-text("Next"), ' +
          'button:has-text("Review your application")',
      )
      if (await this.waitVisible(cont, 8000)) {
        const unanswered = await this.hasUnansweredRequired()
        if (unanswered) {
          return {
            outcome: 'manual',
            kind: 'unknown_challenge',
            checkpoint: `apply_step_${step}`,
            description: `Screener question needs a manual answer: "${unanswered}"`,
          }
        }
        const urlBefore = this.page.url()
        await this.visible(cont).click()
        await this.page.waitForTimeout(2000)
        // Indeed marks required questions with a visual asterisk only (no
        // required/aria-required attributes), so a blocked Continue plus a
        // visible validation error is our signal to hand over to a human.
        if (this.page.url() === urlBefore) {
          const blocker = await this.visibleValidationError()
          if (blocker) {
            const pending = (await this.extractScreenerQuestions().catch(() => []))
              .map((q) => q.question)
              .filter(Boolean)
              .slice(0, 2)
              .join(' | ')
            return {
              outcome: 'manual',
              kind: 'unknown_challenge',
              checkpoint: `apply_step_${step}`,
              description: `Wizard blocked (“${blocker}”)${pending ? ` — unanswered: ${pending}` : ''}. Add a matching screenerAnswers entry or finish this application manually.`,
            }
          }
        }
        continue
      }

      // Nothing actionable found on this step
      return { outcome: 'failed', reason: `Apply wizard stalled at step ${step} (${this.page.url()})` }
    }
    return { outcome: 'failed', reason: 'Apply wizard exceeded 12 steps' }
  }

  /** Fill contact info + screener questions we have confident answers for. */
  private async fillKnownFields(profile: Profile): Promise<void> {
    const byName: Array<[string, string]> = [
      ['input[name*="firstName" i]', profile.fullName.split(' ')[0] ?? profile.fullName],
      ['input[name*="lastName" i]', profile.fullName.split(' ').slice(1).join(' ') || profile.fullName],
      ['input[type="email"]', profile.email],
      ['input[type="tel"], input[name*="phone" i]', profile.phone],
    ]
    for (const [sel, value] of byName) {
      const input = this.visible(this.page.locator(sel))
      if (await input.isVisible().catch(() => false)) {
        if (!(await input.inputValue().catch(() => 'x'))) await input.fill(value).catch(() => undefined)
      }
    }

    // Screener questions: extract them from the DOM and match the question
    // text against configured answers.
    const questions = await this.extractScreenerQuestions().catch(() => [])
    for (const q of questions) {
      const match = Object.entries(profile.screenerAnswers).find(([key]) =>
        q.question.toLowerCase().includes(key.toLowerCase()),
      )
      if (!match) continue
      const answer = match[1]

      if (q.kind === 'radio') {
        const wanted = answer.toLowerCase()
        const option =
          q.options?.find((o) => o.label.toLowerCase() === wanted) ??
          q.options?.find((o) => o.label.toLowerCase().startsWith(wanted))
        if (option) {
          // force: the real input often sits under a styled label
          await this.page
            .locator(`input[name="${q.name}"][value="${option.value}"]`)
            .first()
            .check({ force: true })
            .catch(() => undefined)
        }
      } else {
        await this.page
          .locator(`[name="${q.name}"]`)
          .first()
          .fill(answer)
          .catch(() => undefined)
      }
    }
  }

  /**
   * Pull the visible, still-unanswered screener questions out of the page:
   * radio groups (with their option labels) and empty text fields. The hidden
   * g-recaptcha-response token field is NOT a question and is skipped.
   */
  private async extractScreenerQuestions(): Promise<
    Array<{ kind: 'radio' | 'text'; name: string; question: string; options?: Array<{ value: string; label: string }> }>
  > {
    return this.page.evaluate(() => {
      const isShown = (el: Element) => !!((el as HTMLElement).offsetWidth || (el as HTMLElement).offsetHeight)
      const clean = (s: string) => s.replace(/\s+/g, ' ').trim()
      const questionTextFor = (el: Element): string => {
        let node: Element | null = el.parentElement
        let text = ''
        for (let depth = 0; node && depth < 6; depth++) {
          text = clean((node as HTMLElement).innerText ?? '')
          if (text.length > 15 && /[?*]/.test(text)) break
          node = node.parentElement
        }
        return text.slice(0, 200)
      }

      const out: Array<{
        kind: 'radio' | 'text'
        name: string
        question: string
        options?: Array<{ value: string; label: string }>
      }> = []

      const radioGroups = new Map<string, HTMLInputElement[]>()
      for (const r of Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"]'))) {
        if (!isShown(r) && !isShown(r.closest('label') ?? r)) continue
        const list = radioGroups.get(r.name) ?? []
        list.push(r)
        radioGroups.set(r.name, list)
      }
      for (const [name, radios] of radioGroups) {
        if (radios.some((r) => r.checked)) continue
        const first = radios[0]
        if (!first) continue
        let container: Element | null = first
        while (container && !radios.every((r) => container!.contains(r))) container = container.parentElement
        out.push({
          kind: 'radio',
          name,
          question: container ? clean((container as HTMLElement).innerText).slice(0, 200) : questionTextFor(first),
          options: radios.map((r) => ({
            value: r.value,
            label: clean(
              r.closest('label')?.innerText ??
                (r.id ? document.querySelector(`label[for="${r.id}"]`)?.textContent ?? r.value : r.value),
            ),
          })),
        })
      }

      for (const t of Array.from(
        document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
          'textarea, input[type="text"]:not([name*="location"]), input[type="number"]',
        ),
      )) {
        if (!isShown(t) || t.value) continue
        if (!t.name || t.name === 'g-recaptcha-response') continue
        out.push({ kind: 'text', name: t.name, question: questionTextFor(t) })
      }
      return out
    })
  }

  /** A visible form-validation message blocking the current wizard step. */
  private async visibleValidationError(): Promise<string | null> {
    const err = this.visible(
      this.page.locator('text=/to continue|is required|select an option|choose an option|please answer|please select/i'),
    )
    if (await err.isVisible().catch(() => false)) {
      const text = await err.innerText().catch(() => null)
      return text ? text.trim().slice(0, 120) : 'validation error'
    }
    return null
  }

  /**
   * Returns the label of the first required-but-empty question, if any.
   * Covers text/number/textarea/select values AND radio/checkbox groups
   * (a required radio group with nothing checked must pause the workflow,
   * not silently loop the Continue button).
   */
  private async hasUnansweredRequired(): Promise<string | null> {
    return this.page
      .evaluate(() => {
        const labelFor = (el: Element): string =>
          (el.closest('fieldset, label, div')?.textContent ?? 'required field').trim().slice(0, 120) || 'required field'

        const isRequired = (el: Element): boolean =>
          el.hasAttribute('required') ||
          el.getAttribute('aria-required') === 'true' ||
          el.closest('[aria-required="true"]') !== null

        // Radio/checkbox groups, grouped by name
        const groups = new Map<string, HTMLInputElement[]>()
        for (const input of Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"], input[type="checkbox"]'))) {
          const name = input.name || labelFor(input)
          const list = groups.get(name) ?? []
          list.push(input)
          groups.set(name, list)
        }
        for (const inputs of groups.values()) {
          const required = inputs.some((i) => isRequired(i))
          const answered = inputs.some((i) => i.checked)
          if (required && !answered && inputs[0]) return labelFor(inputs[0])
        }

        // Value-bearing fields
        for (const el of Array.from(
          document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
            'input:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]), textarea, select',
          ),
        )) {
          if (isRequired(el) && !el.value) return labelFor(el)
        }
        return null
      })
      .catch(() => null)
  }
}
