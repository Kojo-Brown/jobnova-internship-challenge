import { useMemo, useState } from 'react'
import type { Job, Tab, WorkMode } from '../types'
import { JobCard } from '../components/JobCard'
import { LiveApplications } from '../components/LiveApplications'
import { MockInterviewRail } from '../components/MockInterviewRail'
import { ListSkeleton } from '../components/Skeletons'
import { RefreshIcon, SearchIcon } from '../components/Icons'
import { useToast } from '../components/Toast'

interface JobListProps {
  jobs: Job[]
  tab: Tab
  loading: boolean
  liked: string[]
  applied: string[]
  onOpen: (job: Job) => void
  onToggleLike: (job: Job) => void
  onApply: (job: Job) => void
}

const workModes: Array<WorkMode | 'All'> = ['All', 'On-site', 'Remote', 'Hybrid']

const emptyCopy: Record<Tab, { title: string; hint: string }> = {
  matched: { title: 'No matches found', hint: 'Try a different search term or clear the filters.' },
  liked: { title: 'No liked jobs yet', hint: 'Tap the heart on a job card to save it here.' },
  applied: { title: 'No applications yet', hint: 'Apply to a matched job and track it here.' },
}

export function JobList({ jobs, tab, loading, liked, applied, onOpen, onToggleLike, onApply }: JobListProps) {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<WorkMode | 'All'>('All')
  const [sortTop, setSortTop] = useState(true)

  const visible = useMemo(() => {
    let list = jobs
    if (tab === 'liked') list = list.filter((j) => liked.includes(j.id))
    if (tab === 'applied') list = list.filter((j) => applied.includes(j.id))
    if (mode !== 'All') list = list.filter((j) => j.workMode === mode)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.name.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q),
      )
    }
    if (sortTop) list = [...list].sort((a, b) => b.matchScore - a.matchScore)
    return list
  }, [jobs, tab, liked, applied, mode, query, sortTop])

  const share = (job: Job) => {
    const url = `${location.origin}${location.pathname}#/job/${job.id}`
    navigator.clipboard?.writeText(url).then(
      () => toast('Job link copied to clipboard'),
      () => toast('Could not copy link', 'info'),
    )
  }

  return (
    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div>
        {/* Part 2 integration: real Indeed application statuses on the Applied tab */}
        {tab === 'applied' && <LiveApplications />}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => toast('Job reference preferences are coming soon in this demo', 'info')}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-200 transition hover:brightness-105"
          >
            <RefreshIcon className="size-4" />
            Change Job Reference
          </button>
          <button
            type="button"
            onClick={() => setSortTop((s) => !s)}
            aria-pressed={sortTop}
            className={`flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
              sortTop ? 'border-brand-300 bg-white text-brand-600' : 'border-gray-200 bg-white text-gray-700 hover:border-brand-300'
            }`}
          >
            <SearchIcon className="size-4" />
            Top matched
          </button>
        </div>

        {/* Extension: search + work-mode filter */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search jobs</span>
            <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, company or location…"
              className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <div className="flex gap-1.5" role="group" aria-label="Filter by work mode">
            {workModes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition sm:text-sm ${
                  mode === m ? 'bg-ink text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-brand-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {loading ? (
            <ListSkeleton />
          ) : visible.length === 0 ? (
            <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
              <p className="text-4xl" aria-hidden="true">
                🔎
              </p>
              <h3 className="mt-3 text-lg font-bold">{emptyCopy[tab].title}</h3>
              <p className="mt-1 text-sm text-gray-500">{emptyCopy[tab].hint}</p>
            </div>
          ) : (
            visible.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                index={i}
                liked={liked.includes(job.id)}
                applied={applied.includes(job.id)}
                onOpen={onOpen}
                onToggleLike={onToggleLike}
                onApply={onApply}
                onMockInterview={() => toast('AI Mock Interview is coming soon in this demo', 'info')}
                onShare={share}
              />
            ))
          )}
        </div>
      </div>

      <div className="xl:sticky xl:top-20">
        <MockInterviewRail />
      </div>
    </div>
  )
}
