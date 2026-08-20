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
   * Wait up to `timeout` ms for a locator to become visible.
   * (`isVisible({timeout})` does NOT wait in Playwright — its timeout option
   * is deprecated and ignored, so we use waitFor instead.)
   */
  private async waitVisible(locator: Locator, timeout: number): Promise<boolean> {
    return locator
      .first()
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

    const applyButton = this.page
      .locator('#indeedApplyButton, button:has-text("Easily apply"), button:has-text("Apply now")')
      .first()
    if (!(await this.waitVisible(applyButton, 8000))) {
      return { outcome: 'failed', reason: 'No Easily apply button on this posting (external ATS?)' }
    }

    // The apply wizard (smartapply.indeed.com) opens either in a popup tab or
    // in-place; race the two so neither path adds a fixed stall.
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 10_000 }).catch(() => null)
    const navPromise = this.page
      .waitForURL(/smartapply|apply/i, { timeout: 10_000 })
      .then(() => null)
      .catch(() => null)
    await applyButton.click()
    const popup = await Promise.race([popupPromise, navPromise])
    if (popup) {
      onPopup(popup)
      this.page = popup
    }
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined)

    // The apply wizard is a multi-step form; walk up to 12 steps.
    for (let step = 0; step < 12; step++) {
      await this.page.waitForTimeout(1200)

      challenge = await this.detectChallenge()
      if (challenge) {
        return { outcome: 'manual', kind: challenge.kind, checkpoint: `apply_step_${step}`, description: challenge.description }
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

      const submit = this.page
        .locator('button:has-text("Submit your application"), button:has-text("Submit application")')
        .first()
      if (await this.waitVisible(submit, 500)) {
        await submit.click()
        await this.page.waitForTimeout(2500)
        challenge = await this.detectChallenge()
        if (challenge) {
          return { outcome: 'manual', kind: challenge.kind, checkpoint: 'submit', description: challenge.description }
        }
        return { outcome: 'submitted' }
      }

      const cont = this.page
        .locator('button:has-text("Continue"), button:has-text("Next"), button[data-testid="continue-button"]')
        .first()
      if (await this.waitVisible(cont, 2000)) {
        const unanswered = await this.hasUnansweredRequired()
        if (unanswered) {
          return {
            outcome: 'manual',
            kind: 'unknown_challenge',
            checkpoint: `apply_step_${step}`,
            description: `Screener question needs a manual answer: "${unanswered}"`,
          }
        }
        await cont.click()
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
      const input = this.page.locator(sel).first()
      if (await input.isVisible().catch(() => false)) {
        if (!(await input.inputValue().catch(() => 'x'))) await input.fill(value).catch(() => undefined)
      }
    }

    // Screener questions: match the question label against configured answers.
    const groups = this.page.locator('fieldset, [data-testid="input-question"]')
    const count = await groups.count().catch(() => 0)
    for (let i = 0; i < count; i++) {
      const group = groups.nth(i)
      const label = ((await group.innerText().catch(() => '')) || '').toLowerCase()
      const match = Object.entries(profile.screenerAnswers).find(([key]) => label.includes(key.toLowerCase()))
      if (!match) continue
      const answer = match[1]

      const radio = group.locator(`label:has-text("${answer}") input[type="radio"], input[type="radio"][value="${answer}" i]`).first()
      if (await radio.isVisible().catch(() => false)) {
        await radio.check().catch(() => undefined)
        continue
      }
      const text = group.locator('input[type="text"], input[type="number"], textarea').first()
      if (await text.isVisible().catch(() => false)) {
        if (!(await text.inputValue().catch(() => 'x'))) await text.fill(answer).catch(() => undefined)
      }
    }
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
