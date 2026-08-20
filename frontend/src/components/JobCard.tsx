import type { Job } from '../types'
import { CompanyLogo } from './CompanyLogo'
import { BroadcastIcon, HeartIcon, LinkIcon, PinIcon } from './Icons'
import { MatchRing } from './MatchRing'

interface JobCardProps {
  job: Job
  liked: boolean
  applied: boolean
  onOpen: (job: Job) => void
  onToggleLike: (job: Job) => void
  onApply: (job: Job) => void
  onMockInterview: (job: Job) => void
  onShare: (job: Job) => void
  /** stagger index for the entrance animation */
  index?: number
}

export function JobCard({ job, liked, applied, onOpen, onToggleLike, onApply, onMockInterview, onShare, index = 0 }: JobCardProps) {
  const tags = [job.employmentType, job.skillsMatchLabel ?? job.experience, job.level, job.salary]

  return (
    <article
      className="animate-card cursor-pointer rounded-3xl bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-brand-200 sm:p-6"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      onClick={() => onOpen(job)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) onOpen(job)
      }}
      tabIndex={0}
      role="link"
      aria-label={`${job.title} at ${job.company.name}, ${job.matchScore}% match`}
    >
      <div className="flex items-start gap-4 sm:gap-5">
        {/* wrappers control visibility so the ring's own display class never conflicts */}
        <span className="hidden sm:block">
          <MatchRing score={job.matchScore} size={84} />
        </span>
        <span className="sm:hidden">
          <MatchRing score={job.matchScore} size={64} strokeWidth={6} />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold leading-snug sm:text-2xl">{job.title}</h3>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-gray-400">
            <CompanyLogo company={job.company} size="sm" />
            <span className="truncate">{job.company.name}</span>
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <PinIcon className="size-4 text-gray-400" />
              {job.location}
            </span>
            <span className="size-1 rounded-full bg-brand-400" aria-hidden="true" />
            <span className="flex items-center gap-1">
              <BroadcastIcon className="size-4 text-gray-400" />
              {job.workMode}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onShare(job)
            }}
            className="text-gray-400 transition hover:text-brand-500"
            aria-label={`Copy link to ${job.title}`}
          >
            <LinkIcon />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleLike(job)
            }}
            aria-pressed={liked}
            aria-label={liked ? `Remove ${job.title} from liked jobs` : `Like ${job.title}`}
            className={liked ? 'animate-heart text-brand-400' : 'text-gray-400 transition hover:text-brand-400'}
          >
            <HeartIcon filled={liked} />
          </button>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Job attributes">
        {tags.map((tag) => (
          <li key={tag} className="rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-700 sm:text-sm">
            {tag}
          </li>
        ))}
      </ul>

      <hr className="my-4 border-gray-100" />

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-gray-700 sm:text-sm">{job.postedAgo}</span>
        <span className="text-xs text-gray-600 sm:text-sm">{job.applicants} applicants</span>
        <div className="ml-auto flex items-center gap-2.5">
          <button
            type="button"
            disabled={applied}
            onClick={(e) => {
              e.stopPropagation()
              onApply(job)
            }}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              applied
                ? 'cursor-default bg-gray-100 text-gray-400'
                : 'border border-gray-200 text-ink hover:border-brand-400 hover:text-brand-600'
            }`}
          >
            {applied ? 'Applied ✓' : 'Apply'}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMockInterview(job)
            }}
            className="rounded-full bg-lime-cta px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-95"
          >
            Mock Interview
          </button>
        </div>
      </div>
    </article>
  )
}
