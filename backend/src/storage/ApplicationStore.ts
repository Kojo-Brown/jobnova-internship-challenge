import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { ApplicationRecord, ApplicationStatus, JobPosting, ManualActionKind } from '../types.js'
import { assertTransition } from '../workflow/stateMachine.js'
import { JsonStore } from './JsonStore.js'

interface Doc {
  applications: ApplicationRecord[]
}

/**
 * Records every application and its status history:
 * pending / in_progress / submitted / failed / manual_action_required.
 */
export class ApplicationStore {
  private store: JsonStore<Doc>

  constructor(dataDir: string) {
    this.store = new JsonStore<Doc>(path.join(dataDir, 'applications.json'), { applications: [] })
  }

  async list(user?: string): Promise<ApplicationRecord[]> {
    const { applications } = await this.store.read()
    return user ? applications.filter((a) => a.user === user) : applications
  }

  async get(id: string): Promise<ApplicationRecord | undefined> {
    return (await this.list()).find((a) => a.id === id)
  }

  /** Queue a job as pending. Returns the existing record if already queued for this user. */
  async enqueue(user: string, job: JobPosting): Promise<ApplicationRecord> {
    let result: ApplicationRecord | undefined
    await this.store.update((doc) => {
      const existing = doc.applications.find((a) => a.user === user && a.jobKey === job.jobKey)
      if (existing) {
        result = existing
        return doc
      }
      const now = new Date().toISOString()
      const record: ApplicationRecord = {
        id: randomUUID(),
        user,
        jobKey: job.jobKey,
        title: job.title,
        company: job.company,
        url: job.url,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        events: [{ at: now, status: 'pending', message: 'Queued for application' }],
      }
      doc.applications.push(record)
      result = record
      return doc
    })
    return result!
  }

  async transition(
    id: string,
    to: ApplicationStatus,
    message: string,
    extra: { manualAction?: ManualActionKind; checkpoint?: string } = {},
  ): Promise<ApplicationRecord> {
    let result: ApplicationRecord | undefined
    await this.store.update((doc) => {
      const record = doc.applications.find((a) => a.id === id)
      if (!record) throw new Error(`Unknown application: ${id}`)
      assertTransition(record.status, to)
      const now = new Date().toISOString()
      record.status = to
      record.updatedAt = now
      record.manualAction = to === 'manual_action_required' ? extra.manualAction ?? 'unknown_challenge' : undefined
      if (extra.checkpoint !== undefined) record.checkpoint = extra.checkpoint
      if (to === 'submitted') record.checkpoint = undefined
      record.events.push({ at: now, status: to, message })
      result = record
      return doc
    })
    return result!
  }
}
