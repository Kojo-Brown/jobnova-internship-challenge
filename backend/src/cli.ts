#!/usr/bin/env node
import { loadConfig } from './config.js'
import { loadProfile } from './profile.js'
import { SessionStore } from './session/SessionStore.js'
import { ApplicationStore } from './storage/ApplicationStore.js'
import { ApplyWorkflow } from './workflow/ApplyWorkflow.js'

const HELP = `jobnova-indeed-autoapply

Usage: npm run cli -- <command>

Commands:
  login             Open a headed browser for manual Indeed login (incl. any
                    verification), then save the encrypted session.
  discover          Search Indeed for suitable jobs and queue them (pending).
  apply             Process the queue end-to-end (discover first if empty).
  resume            Re-run applications paused for manual action.
  retry <id>        Requeue one failed application.
  status            Show every application and its current status.
  logout            Delete the stored session.
`

async function main(): Promise<void> {
  const [command, arg] = process.argv.slice(2)
  if (!command || command === 'help' || command === '--help') {
    console.log(HELP)
    return
  }

  const config = loadConfig()
  const profile = await loadProfile()
  const sessions = new SessionStore(config.dataDir, config.sessionEncKey)
  const applications = new ApplicationStore(config.dataDir)
  const workflow = new ApplyWorkflow({
    sessions,
    applications,
    profile,
    headless: config.headless,
    log: (msg) => console.log(msg),
  })

  switch (command) {
    case 'login': {
      const ok = await workflow.interactiveLogin()
      console.log(ok ? 'Session saved (encrypted).' : 'Login not completed.')
      process.exitCode = ok ? 0 : 1
      break
    }
    case 'discover': {
      const records = await workflow.discoverJobs()
      for (const r of records) console.log(`  [${r.status}] ${r.title} @ ${r.company}`)
      break
    }
    case 'apply': {
      const queued = (await applications.list(profile.user)).some((a) => a.status === 'pending')
      if (!queued) await workflow.discoverJobs()
      const summary = await workflow.run()
      console.log(
        `Done. processed=${summary.processed.length} paused_for_manual_action=${summary.pausedForManualAction.length}`,
      )
      break
    }
    case 'resume': {
      const summary = await workflow.resume()
      console.log(
        `Done. processed=${summary.processed.length} paused_for_manual_action=${summary.pausedForManualAction.length}`,
      )
      break
    }
    case 'retry': {
      if (!arg) throw new Error('Usage: retry <application-id>')
      const record = await workflow.retry(arg)
      console.log(`Requeued: ${record.title} [${record.status}]`)
      break
    }
    case 'status': {
      const records = await applications.list(profile.user)
      if (records.length === 0) {
        console.log('No applications recorded yet.')
        break
      }
      for (const r of records) {
        const manual = r.manualAction ? ` (${r.manualAction}${r.checkpoint ? ` @ ${r.checkpoint}` : ''})` : ''
        console.log(`${r.id}  [${r.status}]${manual}  ${r.title} @ ${r.company}`)
        const last = r.events[r.events.length - 1]
        if (last) console.log(`    last event: ${last.at} — ${last.message}`)
      }
      break
    }
    case 'logout': {
      await sessions.delete(profile.user)
      console.log('Stored session deleted.')
      break
    }
    default:
      console.error(`Unknown command: ${command}\n`)
      console.log(HELP)
      process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exitCode = 1
})
