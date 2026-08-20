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
  return match ? match[1] : null
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

  const toggleLike = useCallback(
    (job: Job) => {
      setLiked((prev) => {
        const isLiked = prev.includes(job.id)
        toast(isLiked ? 'Removed from liked jobs' : 'Added to liked jobs', isLiked ? 'info' : 'success')
        return isLiked ? prev.filter((id) => id !== job.id) : [...prev, job.id]
      })
    },
    [setLiked, toast],
  )

  const apply = useCallback(
    (job: Job) => {
      setApplied((prev) => {
        if (prev.includes(job.id)) return prev
        toast(`Application sent to ${job.company.name} 🎉`)
        return [...prev, job.id]
      })
    },
    [setApplied, toast],
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
