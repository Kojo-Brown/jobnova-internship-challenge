import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { ApplicationStore } from '../src/storage/ApplicationStore.js'

let dir: string
let store: ApplicationStore

const job = {
  jobKey: 'abc123',
  title: 'Software Engineer Intern',
  company: 'Acme',
  url: 'https://www.indeed.com/viewjob?jk=abc123',
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'jobnova-test-'))
  store = new ApplicationStore(dir)
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('ApplicationStore', () => {
  it('enqueues a job as pending with an initial event', async () => {
    const record = await store.enqueue('kojo', job)
    expect(record.status).toBe('pending')
    expect(record.events).toHaveLength(1)
    expect(record.events[0]?.message).toContain('Queued')
  })

  it('deduplicates by user + jobKey', async () => {
    const first = await store.enqueue('kojo', job)
    const second = await store.enqueue('kojo', job)
    expect(second.id).toBe(first.id)
    expect(await store.list('kojo')).toHaveLength(1)
    // a different user may queue the same job
    await store.enqueue('ama', job)
    expect(await store.list()).toHaveLength(2)
  })

  it('tracks the full lifecycle with an event log', async () => {
    const record = await store.enqueue('kojo', job)
    await store.transition(record.id, 'in_progress', 'Started')
    const paused = await store.transition(record.id, 'manual_action_required', 'CAPTCHA shown', {
      manualAction: 'captcha',
      checkpoint: 'apply_step_2',
    })
    expect(paused.manualAction).toBe('captcha')
    expect(paused.checkpoint).toBe('apply_step_2')

    await store.transition(record.id, 'in_progress', 'Resumed')
    const done = await store.transition(record.id, 'submitted', 'Submitted')
    expect(done.status).toBe('submitted')
    expect(done.manualAction).toBeUndefined()
    expect(done.checkpoint).toBeUndefined()
    expect(done.events.map((e) => e.status)).toEqual([
      'pending',
      'in_progress',
      'manual_action_required',
      'in_progress',
      'submitted',
    ])
  })

  it('rejects illegal transitions', async () => {
    const record = await store.enqueue('kojo', job)
    await expect(store.transition(record.id, 'submitted', 'skip ahead')).rejects.toThrow('Illegal status transition')
  })

  it('persists across store instances', async () => {
    const record = await store.enqueue('kojo', job)
    await store.transition(record.id, 'in_progress', 'Started')
    const reopened = new ApplicationStore(dir)
    const loaded = await reopened.get(record.id)
    expect(loaded?.status).toBe('in_progress')
  })

  it('serializes concurrent updates without losing writes', async () => {
    const jobs = Array.from({ length: 10 }, (_, i) => ({ ...job, jobKey: `key-${i}` }))
    await Promise.all(jobs.map((j) => store.enqueue('kojo', j)))
    expect(await store.list('kojo')).toHaveLength(10)
  })
})
