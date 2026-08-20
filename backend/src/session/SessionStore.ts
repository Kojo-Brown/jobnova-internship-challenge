import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { decrypt, encrypt } from './crypto.js'

/** Playwright storageState shape (cookies + origins). Kept loose on purpose. */
export type StorageState = {
  cookies: Array<Record<string, unknown>>
  origins: Array<Record<string, unknown>>
}

/**
 * Persists one browser session per user as an AES-256-GCM-encrypted blob.
 * The browser itself never stays running — after each workflow step the
 * storage state (cookies, local storage) is captured, encrypted and written
 * to disk; the next run rehydrates a fresh browser context from it.
 */
export class SessionStore {
  constructor(
    private readonly dataDir: string,
    private readonly keyHex: string,
  ) {}

  private fileFor(user: string): string {
    const safe = user.replace(/[^a-zA-Z0-9_-]/g, '_')
    return path.join(this.dataDir, 'sessions', `${safe}.session.enc`)
  }

  async save(user: string, state: StorageState): Promise<void> {
    const file = this.fileFor(user)
    await mkdir(path.dirname(file), { recursive: true })
    const payload = encrypt(JSON.stringify(state), this.keyHex)
    const tmp = `${file}.tmp`
    await writeFile(tmp, payload, 'utf8')
    const { rename } = await import('node:fs/promises')
    await rename(tmp, file)
  }

  async load(user: string): Promise<StorageState | null> {
    try {
      const payload = await readFile(this.fileFor(user), 'utf8')
      return JSON.parse(decrypt(payload, this.keyHex)) as StorageState
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
      throw new Error(`Failed to restore session for "${user}": ${(err as Error).message}`)
    }
  }

  async delete(user: string): Promise<void> {
    await rm(this.fileFor(user), { force: true })
  }

  async exists(user: string): Promise<boolean> {
    return (await this.load(user).catch(() => null)) !== null
  }
}
