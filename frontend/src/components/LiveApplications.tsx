import { useCallback, useEffect, useState } from 'react'
import { RefreshIcon } from './Icons'

/** Record shape served by the auto-apply backend (backend/src/types.ts). */
interface LiveApplication {
  id: string
  title: string
  company: string
  url: string
  status: 'pending' | 'in_progress' | 'submitted' | 'failed' | 'manual_action_required'
  manualAction?: string
  events: Array<{ at: string; status: string; message: string }>
}

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000'

const statusStyles: Record<LiveApplication['status'], { label: string; className: string }> = {
  submitted: { label: 'Submitted', className: 'bg-lime-ring/30 text-lime-900' },
  in_progress: { label: 'In progress', className: 'bg-brand-100 text-brand-600' },
  pending: { label: 'Pending', className: 'bg-gray-100 text-gray-600' },
  manual_action_required: { label: 'Needs you', className: 'bg-amber-100 text-amber-800' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-700' },
}

type FetchState = 'loading' | 'ready' | 'offline'

/**
 * Live view of the Indeed auto-apply backend (Part 2 of the challenge).
 * Fetches real application records from the local API; degrades gracefully
 * when the backend isn't running (e.g. on the deployed static demo).
 */
export function LiveApplications() {
  const [state, setState] = useState<FetchState>('loading')
  const [records, setRecords] = useState<LiveApplication[]>([])

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setState('loading')
    try {
      const res = await fetch(`${API_BASE}/applications`, { signal: AbortSignal.timeout(4000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setRecords((await res.json()) as LiveApplication[])
      setState('ready')
    } catch {
      setState('offline')
    }
  }, [])

  // initial state is already 'loading'; the effect only kicks off the async
  // fetch (a legitimate external-system sync — state is set after the await)
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    void load()
  }, [load])

  return (
    <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6" aria-label="Live Indeed applications">
      <div className="flex items-center gap-2">
        <span className="relative flex size-2.5" aria-hidden="true">
          {state === 'ready' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-ring opacity-60" />}
          <span className={`relative inline-flex size-2.5 rounded-full ${state === 'ready' ? 'bg-lime-ring' : 'bg-gray-300'}`} />
        </span>
        <h2 className="font-bold">Live Indeed applications</h2>
        <span className="text-xs text-gray-400">via auto-apply backend</span>
        <button
          type="button"
          onClick={() => void load(true)}
          className="ml-auto flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-brand-300 hover:text-brand-600"
          aria-label="Refresh live applications"
        >
          <RefreshIcon className="size-3.5" />
          Refresh
        </button>
      </div>

      {state === 'loading' ? (
        <div className="mt-4 space-y-2" aria-hidden="true">
          <div className="skeleton h-12 rounded-xl" />
          <div className="skeleton h-12 rounded-xl" />
        </div>
      ) : state === 'offline' ? (
        <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Backend offline — start it with <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">npm run serve</code> in{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">backend/</code> to see real Indeed application
          statuses here.
        </p>
      ) : records.length === 0 ? (
        <p className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
          No applications recorded yet — queue some with the backend CLI.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {records.map((r) => {
            const badge = statusStyles[r.status] ?? statusStyles.pending
            const last = r.events[r.events.length - 1]
            return (
              <li key={r.id} className="rounded-xl border border-gray-100 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <a href={r.url} target="_blank" rel="noreferrer" className="font-semibold hover:text-brand-600 hover:underline">
                    {r.title}
                  </a>
                  <span className="text-sm text-gray-400">@ {r.company}</span>
                  <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-bold ${badge.className}`}>{badge.label}</span>
                </div>
                {last && (
                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(last.at).toLocaleString()} — {last.message}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
