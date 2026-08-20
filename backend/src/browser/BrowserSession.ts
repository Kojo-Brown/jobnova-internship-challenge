import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import type { SessionStore, StorageState } from '../session/SessionStore.js'

/**
 * Short-lived browser wrapper. Each unit of work:
 *   open() -> restore encrypted storage state -> do work -> persist() -> close()
 * so no browser has to stay running between workflow steps ("remote session
 * management"): the login lives in the encrypted session file, not in RAM.
 */
export class BrowserSession {
  private browser: Browser | null = null
  private context: BrowserContext | null = null

  constructor(
    private readonly sessions: SessionStore,
    private readonly user: string,
    private readonly headless: boolean,
  ) {}

  async open(): Promise<Page> {
    const state = await this.sessions.load(this.user)
    // Prefer the real installed Chrome and drop the automation blink flag:
    // Playwright's bundled Chromium trips Cloudflare's bot heuristics, which
    // makes even a MANUAL challenge solve loop forever. We are not bypassing
    // any check — the human still solves it — we just avoid presenting a
    // browser that is falsely flagged before they get the chance.
    const launchOptions = {
      headless: this.headless,
      args: ['--disable-blink-features=AutomationControlled'],
    }
    this.browser = await chromium
      .launch({ ...launchOptions, channel: 'chrome' })
      .catch(() => chromium.launch(launchOptions))
    this.context = await this.browser.newContext({
      // Playwright accepts the exact JSON produced by storageState()
      storageState: (state as never) ?? undefined,
      // headed: use the OS window size for a natural fingerprint
      viewport: this.headless ? { width: 1366, height: 850 } : null,
    })
    return this.context.newPage()
  }

  /** Capture + encrypt + store the current login state. */
  async persist(): Promise<void> {
    if (!this.context) throw new Error('Browser session is not open')
    const state = (await this.context.storageState()) as unknown as StorageState
    await this.sessions.save(this.user, state)
  }

  async close(options: { persist?: boolean } = {}): Promise<void> {
    if (options.persist !== false && this.context) {
      await this.persist().catch(() => undefined)
    }
    await this.context?.close().catch(() => undefined)
    await this.browser?.close().catch(() => undefined)
    this.context = null
    this.browser = null
  }
}
