import type { ApplicationRecord, Profile } from '../types.js'
import type { ApplicationStore } from '../storage/ApplicationStore.js'
import type { SessionStore } from '../session/SessionStore.js'
import { BrowserSession } from '../browser/BrowserSession.js'
import { IndeedClient } from '../indeed/IndeedClient.js'
import { isRunnable } from './stateMachine.js'

export interface WorkflowDeps {
  sessions: SessionStore
  applications: ApplicationStore
  profile: Profile
  headless: boolean
  log?: (msg: string) => void
}

export interface RunSummary {
  processed: ApplicationRecord[]
  pausedForManualAction: ApplicationRecord[]
}

/**
 * Orchestrates the end-to-end flow:
 *
 *   restore session ─▶ verify login ─▶ (search + enqueue) ─▶ apply to each
 *   queued job ─▶ persist session ─▶ close browser
 *
 * Any manual-verification wall (CAPTCHA / SMS / email) pauses the affected
 * application with a checkpoint instead of bypassing anything. `resume()`
 * re-runs those applications after the operator has cleared the challenge
 * (typically via `interactiveLogin()` in a headed browser).
 */
export class ApplyWorkflow {
  constructor(private readonly deps: WorkflowDeps) {}

  private log(msg: string): void {
    this.deps.log?.(msg)
  }

  /**
   * Open a headed browser so the operator can log in / clear a challenge
   * manually. We wait until login is confirmed, then persist the session.
   * Nothing about the check itself is automated.
   */
  async interactiveLogin(timeoutMinutes = 10): Promise<boolean> {
    const session = new BrowserSession(this.deps.sessions, this.deps.profile.user, false)
    const page = await session.open()
    try {
      const client = new IndeedClient(page)
      if (await client.isLoggedIn()) {
        this.log('Existing session is still valid.')
        return true
      }
      await client.gotoLogin()
      this.log('Complete the login (including any SMS/email/CAPTCHA check) in the opened browser…')
      const deadline = Date.now() + timeoutMinutes * 60_000
      while (Date.now() < deadline) {
        await page.waitForTimeout(5000)
        if (await client.isLoggedIn()) {
          this.log('Login detected — saving encrypted session.')
          return true
        }
      }
      this.log('Timed out waiting for manual login.')
      return false
    } finally {
      await session.close({ persist: true })
    }
  }

  /** Search Indeed for suitable jobs and queue them as pending applications. */
  async discoverJobs(): Promise<ApplicationRecord[]> {
    const { profile } = this.deps
    const session = new BrowserSession(this.deps.sessions, profile.user, this.deps.headless)
    const page = await session.open()
    try {
      const client = new IndeedClient(page)
      if (!(await client.isLoggedIn())) {
        throw new Error('Not logged in. Run the "login" command first (headed manual login).')
      }
      const jobs = await client.searchJobs(profile, profile.jobPreferences.maxApplications)
      this.log(`Found ${jobs.length} suitable "Easily apply" job(s).`)
      const records: ApplicationRecord[] = []
      for (const job of jobs) {
        records.push(await this.deps.applications.enqueue(profile.user, job))
      }
      return records
    } finally {
      await session.close({ persist: true })
    }
  }

  /** Process every runnable application (pending / paused / interrupted). */
  async run(): Promise<RunSummary> {
    const { profile, applications } = this.deps
    const queue = (await applications.list(profile.user)).filter((a) => isRunnable(a.status))
    const summary: RunSummary = { processed: [], pausedForManualAction: [] }
    if (queue.length === 0) {
      this.log('Nothing to process — queue jobs first with "discover".')
      return summary
    }

    const session = new BrowserSession(this.deps.sessions, profile.user, this.deps.headless)
    const page = await session.open()
    try {
      const client = new IndeedClient(page)

      if (!(await client.isLoggedIn())) {
        // Pause everything: the operator must re-establish the session.
        for (const record of queue) {
          if (record.status === 'manual_action_required') {
            summary.pausedForManualAction.push(record)
            continue
          }
          // pending records must pass through in_progress; interrupted
          // in_progress records can pause directly
          const inProgress =
            record.status === 'pending'
              ? await applications.transition(record.id, 'in_progress', 'Started processing')
              : record
          summary.pausedForManualAction.push(
            await applications.transition(
              inProgress.id,
              'manual_action_required',
              'Indeed session expired — manual login required',
              { manualAction: 'login_required', checkpoint: 'login' },
            ),
          )
        }
        this.log('Session invalid/expired — run "login" to re-authenticate, then "resume".')
        return summary
      }

      for (const record of queue) {
        const active =
          record.status === 'in_progress'
            ? record
            : await applications.transition(record.id, 'in_progress', record.status === 'manual_action_required' ? 'Resumed after manual action' : 'Started application')
        this.log(`Applying: ${active.title} @ ${active.company}`)

        try {
          const result = await new IndeedClient(page).apply(
            { jobKey: active.jobKey, title: active.title, company: active.company, url: active.url },
            profile,
          )
          if (result.outcome === 'submitted') {
            summary.processed.push(await applications.transition(active.id, 'submitted', 'Application submitted on Indeed'))
            this.log('  ✓ submitted')
          } else if (result.outcome === 'manual') {
            const paused = await applications.transition(active.id, 'manual_action_required', result.description, {
              manualAction: result.kind,
              checkpoint: result.checkpoint,
            })
            summary.pausedForManualAction.push(paused)
            this.log(`  ⏸ paused (${result.kind}): ${result.description}`)
            // A challenge usually gates the whole session — stop processing further jobs.
            if (result.kind === 'captcha' || result.kind === 'login_required') break
          } else {
            summary.processed.push(await applications.transition(active.id, 'failed', result.reason))
            this.log(`  ✗ failed: ${result.reason}`)
          }
        } catch (err) {
          summary.processed.push(
            await applications.transition(active.id, 'failed', `Unexpected error: ${(err as Error).message}`),
          )
          this.log(`  ✗ error: ${(err as Error).message}`)
        }
        // Persist cookies between applications so a crash loses nothing.
        await session.persist().catch(() => undefined)
      }
      return summary
    } finally {
      await session.close({ persist: true })
    }
  }

  /** Alias for run(): paused applications are runnable again after the operator clears the challenge. */
  async resume(): Promise<RunSummary> {
    return this.run()
  }

  /** Requeue one failed application. */
  async retry(applicationId: string): Promise<ApplicationRecord> {
    return this.deps.applications.transition(applicationId, 'pending', 'Requeued for retry')
  }
}
