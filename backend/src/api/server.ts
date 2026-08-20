import express from 'express'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadConfig } from '../config.js'
import { loadProfile } from '../profile.js'
import { SessionStore } from '../session/SessionStore.js'
import { ApplicationStore } from '../storage/ApplicationStore.js'
import { ApplyWorkflow } from '../workflow/ApplyWorkflow.js'

/**
 * Small control-plane HTTP API around the workflow. One workflow run at a
 * time (Indeed sessions are per-user and the module is single-user for now —
 * see README "multi-user" section for the extension path).
 */
export function createServer() {
  const app = express()
  app.use(express.json())

  // Read-only CORS so the frontend demo (Vite dev server / GitHub Pages) can
  // display live application statuses. Mutating routes stay same-origin.
  app.use((req, res, next) => {
    if (req.method === 'GET' || req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET')
    }
    next()
  })

  let busy = false

  // Singleton stores: all requests must share one JsonStore instance so its
  // write queue actually serializes concurrent updates. Built lazily so
  // /health works before profile.json/.env exist.
  interface Deps {
    workflow: ApplyWorkflow
    applications: ApplicationStore
    sessions: SessionStore
    profile: Awaited<ReturnType<typeof loadProfile>>
  }

  let depsPromise: Promise<Deps> | null = null

  const withWorkflow = (): Promise<Deps> => {
    depsPromise ??= (async () => {
      const config = loadConfig()
      const profile = await loadProfile()
      const sessions = new SessionStore(config.dataDir, config.sessionEncKey)
      const applications = new ApplicationStore(config.dataDir)
      const workflow = new ApplyWorkflow({ sessions, applications, profile, headless: config.headless, log: console.log })
      return { workflow, applications, sessions, profile }
    })().catch((err) => {
      // bad config/profile: allow a retry once the operator fixes it
      depsPromise = null
      throw err
    })
    return depsPromise
  }

  const runExclusive = async (
    res: express.Response,
    task: () => Promise<unknown>,
  ): Promise<void> => {
    if (busy) {
      res.status(409).json({ error: 'A workflow run is already in progress' })
      return
    }
    busy = true
    try {
      res.json({ ok: true, result: await task() })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    } finally {
      busy = false
    }
  }

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/applications', async (_req, res) => {
    try {
      const { applications, profile } = await withWorkflow()
      res.json(await applications.list(profile.user))
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  app.get('/session', async (_req, res) => {
    try {
      const { sessions, profile } = await withWorkflow()
      res.json({ user: profile.user, hasStoredSession: await sessions.exists(profile.user) })
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  app.post('/workflow/discover', async (_req, res) => {
    await runExclusive(res, async () => (await withWorkflow()).workflow.discoverJobs())
  })

  app.post('/workflow/run', async (_req, res) => {
    await runExclusive(res, async () => (await withWorkflow()).workflow.run())
  })

  app.post('/workflow/resume', async (_req, res) => {
    await runExclusive(res, async () => (await withWorkflow()).workflow.resume())
  })

  app.post('/applications/:id/retry', async (req, res) => {
    // Shares the exclusive lock: a retry must not interleave with a running
    // workflow's read-modify-write cycle on the same store.
    await runExclusive(res, async () => (await withWorkflow()).workflow.retry(req.params.id))
  })

  return app
}

// Run directly (npm run serve)
const invokedDirectly = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url
  : false
if (invokedDirectly) {
  const port = Number(process.env.PORT ?? 4000)
  createServer().listen(port, () => console.log(`Indeed auto-apply API listening on :${port}`))
}
