import { useCallback, useEffect, useState } from 'react'
import { jobs as allJobs, getJob } from './data/jobs'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Job, Plan, Tab } from './types'
import { Sidebar } from './components/Sidebar'
import { ToastProvider, useToast } from './components/Toast'
import { TopNav } from './components/TopNav'
import { JobDetail } from './pages/JobDetail'
import { JobList } from './pages/JobList'

function jobIdFromHash(): string | null {
  const match = window.location.hash.match(/^#\/job\/([\w-]+)/)
  const id = match ? match[1] : null
  // unknown ids (stale or mistyped share links) fall back to the list
  return id && getJob(id) ? id : null
}

function AppInner() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('matched')
  const [selectedId, setSelectedId] = useState<string | null>(jobIdFromHash)
  const [liked, setLiked] = useLocalStorage<string[]>('jobnova.liked', [])
  const [applied, setApplied] = useLocalStorage<string[]>('jobnova.applied', [])
  const [plan, setPlan] = useLocalStorage<Plan>('jobnova.plan', 'free')
  const [menuOpen, setMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Simulated initial fetch to demo the skeleton state
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  // Hash-based routing so job pages are shareable / back-button friendly
  useEffect(() => {
    const onHashChange = () => setSelectedId(jobIdFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [selectedId, tab])

  const openJob = useCallback((job: Job) => {
    window.location.hash = `#/job/${job.id}`
  }, [])

  const closeJob = useCallback(() => {
    window.location.hash = '#/'
  }, [])

  // Toasts fire outside the setState updaters — updaters must stay pure
  // (StrictMode double-invokes them, which would double every toast).
  const toggleLike = useCallback(
    (job: Job) => {
      const isLiked = liked.includes(job.id)
      toast(isLiked ? 'Removed from liked jobs' : 'Added to liked jobs', isLiked ? 'info' : 'success')
      setLiked((prev) => (prev.includes(job.id) ? prev.filter((id) => id !== job.id) : [...prev, job.id]))
    },
    [liked, setLiked, toast],
  )

  const apply = useCallback(
    (job: Job) => {
      if (applied.includes(job.id)) return
      toast(`Application sent to ${job.company.name} 🎉`)
      setApplied((prev) => (prev.includes(job.id) ? prev : [...prev, job.id]))
    },
    [applied, setApplied, toast],
  )

  const upgrade = useCallback(() => {
    setPlan('pro')
    toast('Pro plan activated — match insights unlocked ✨')
  }, [setPlan, toast])

  const selectedJob = selectedId ? getJob(selectedId) : undefined

  return (
    <div className="min-h-dvh">
      <TopNav
        tab={tab}
        onTabChange={(next) => {
          setTab(next)
          if (selectedJob) closeJob()
        }}
        likedCount={liked.length}
        appliedCount={applied.length}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <div className="mx-auto flex max-w-[1400px]">
        <Sidebar plan={plan} onUpgrade={upgrade} open={menuOpen} onClose={() => setMenuOpen(false)} />
        {selectedJob ? (
          <JobDetail
            job={selectedJob}
            plan={plan}
            liked={liked.includes(selectedJob.id)}
            applied={applied.includes(selectedJob.id)}
            onBack={closeJob}
            onToggleLike={toggleLike}
            onApply={apply}
            onUpgrade={upgrade}
          />
        ) : (
          <JobList
            jobs={allJobs}
            tab={tab}
            loading={loading}
            liked={liked}
            applied={applied}
            onOpen={openJob}
            onToggleLike={toggleLike}
            onApply={apply}
          />
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  )
}
