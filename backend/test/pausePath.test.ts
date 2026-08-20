import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { ApplicationStore } from '../src/storage/ApplicationStore.js'

/**
 * Regression test for the expired-session pause path in ApplyWorkflow.run():
 * every runnable record — pending, interrupted in_progress, or already
 * paused — must be able to land in manual_action_required without an illegal
 * transition. This mirrors the exact transition sequence the workflow uses.
 */

let dir: string
let store: ApplicationStore

const job = (key: string) => ({
  jobKey: key,
  title: 'Engineer',
  company: 'Acme',
  url: `https://www.indeed.com/viewjob?jk=${key}`,
})

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'jobnova-pause-'))
  store = new ApplicationStore(dir)
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('expired-session pause path', () => {
  it('pauses a pending record via in_progress', async () => {
    const record = await store.enqueue('kojo', job('a'))
    const inProgress = await store.transition(record.id, 'in_progress', 'Started processing')
    const paused = await store.transition(inProgress.id, 'manual_action_required', 'Session expired', {
      manualAction: 'login_required',
      checkpoint: 'login',
    })
    expect(paused.status).toBe('manual_action_required')
    expect(paused.manualAction).toBe('login_required')
  })

  it('pauses an interrupted in_progress record directly (no in_progress -> in_progress)', async () => {
    const record = await store.enqueue('kojo', job('b'))
    await store.transition(record.id, 'in_progress', 'Started, then the process crashed')
    // direct pause must be legal; a repeated in_progress transition must not be
    await expect(store.transition(record.id, 'in_progress', 'restart')).rejects.toThrow('Illegal status transition')
    const paused = await store.transition(record.id, 'manual_action_required', 'Session expired', {
      manualAction: 'login_required',
      checkpoint: 'login',
    })
    expect(paused.status).toBe('manual_action_required')
  })

  it('resumes a paused record back to in_progress and on to submitted', async () => {
    const record = await store.enqueue('kojo', job('c'))
    await store.transition(record.id, 'in_progress', 'Started')
    await store.transition(record.id, 'manual_action_required', 'CAPTCHA', { manualAction: 'captcha' })
    await store.transition(record.id, 'in_progress', 'Resumed after manual action')
    const done = await store.transition(record.id, 'submitted', 'Submitted')
    expect(done.status).toBe('submitted')
  })
})
