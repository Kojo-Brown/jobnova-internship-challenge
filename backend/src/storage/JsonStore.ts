import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Tiny JSON-file document store with atomic writes (write temp + rename) and
 * a serialized write queue so concurrent updates can't interleave.
 * Deliberately dependency-free; swap for SQLite/Postgres in production.
 */
export class JsonStore<T> {
  private queue: Promise<unknown> = Promise.resolve()

  constructor(
    private readonly file: string,
    private readonly empty: T,
  ) {}

  async read(): Promise<T> {
    try {
      return JSON.parse(await readFile(this.file, 'utf8')) as T
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return structuredClone(this.empty)
      throw err
    }
  }

  /** Read-modify-write under a queue lock. Returns the updated document. */
  update(mutate: (doc: T) => T | void): Promise<T> {
    const task = this.queue.then(async () => {
      const doc = await this.read()
      const next = mutate(doc) ?? doc
      await mkdir(path.dirname(this.file), { recursive: true })
      const tmp = `${this.file}.tmp`
      await writeFile(tmp, JSON.stringify(next, null, 2), 'utf8')
      await rename(tmp, this.file)
      return next
    })
    // keep the chain alive even if a task rejects
    this.queue = task.catch(() => undefined)
    return task
  }
}
