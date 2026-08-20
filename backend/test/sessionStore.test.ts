import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { SessionStore, type StorageState } from '../src/session/SessionStore.js'

let dir: string
let store: SessionStore
const key = randomBytes(32).toString('hex')

const state: StorageState = {
  cookies: [{ name: 'CTK', value: 'super-secret-token', domain: '.indeed.com' }],
  origins: [{ origin: 'https://www.indeed.com', localStorage: [] }],
}

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), 'jobnova-session-'))
  store = new SessionStore(dir, key)
})

afterEach(async () => {
  await rm(dir, { recursive: true, force: true })
})

describe('SessionStore', () => {
  it('round-trips a storage state', async () => {
    await store.save('kojo', state)
    expect(await store.load('kojo')).toEqual(state)
  })

  it('stores nothing readable on disk (encrypted at rest)', async () => {
    await store.save('kojo', state)
    const files = await readdir(path.join(dir, 'sessions'))
    expect(files).toHaveLength(1)
    const raw = await readFile(path.join(dir, 'sessions', files[0]!), 'utf8')
    expect(raw).not.toContain('super-secret-token')
    expect(raw).not.toContain('indeed')
  })

  it('returns null for unknown users', async () => {
    expect(await store.load('nobody')).toBeNull()
  })

  it('sanitizes user ids used as file names', async () => {
    await store.save('../evil/../../user', state)
    const files = await readdir(path.join(dir, 'sessions'))
    expect(files).toHaveLength(1)
    expect(files[0]).not.toContain('..')
    expect(await store.load('../evil/../../user')).toEqual(state)
  })

  it('deletes sessions', async () => {
    await store.save('kojo', state)
    await store.delete('kojo')
    expect(await store.load('kojo')).toBeNull()
    expect(await store.exists('kojo')).toBe(false)
  })

  it('fails loudly when the key is wrong', async () => {
    await store.save('kojo', state)
    const wrong = new SessionStore(dir, randomBytes(32).toString('hex'))
    await expect(wrong.load('kojo')).rejects.toThrow('Failed to restore session')
  })
})
