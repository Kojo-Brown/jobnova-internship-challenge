import type { Job, Plan } from '../types'
import { CompanyLogo } from '../components/CompanyLogo'
import { FitPanel } from '../components/FitPanel'
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  BroadcastIcon,
  ClockIcon,
  ExternalIcon,
  HeartIcon,
  LaptopIcon,
  LevelIcon,
  PinIcon,
  RobotIcon,
  SalaryIcon,
} from '../components/Icons'
import { MatchRing } from '../components/MatchRing'
import { useToast } from '../components/Toast'

interface JobDetailProps {
  job: Job
  plan: Plan
  liked: boolean
  applied: boolean
  onBack: () => void
  onToggleLike: (job: Job) => void
  onApply: (job: Job) => void
  onUpgrade: () => void
}

export function JobDetail({ job, plan, liked, applied, onBack, onToggleLike, onApply, onUpgrade }: JobDetailProps) {
  const toast = useToast()

  const meta = [
    { icon: PinIcon, label: job.country },
    { icon: LaptopIcon, label: job.employmentType },
    { icon: BroadcastIcon, label: job.workMode },
    { icon: ClockIcon, label: job.experience.includes('skills') ? '2+ years exp' : job.experience },
    { icon: SalaryIcon, label: job.salary },
    { icon: LevelIcon, label: job.level },
  ]

  const share = () => {
    const url = `${location.origin}${location.pathname}#/job/${job.id}`
    navigator.clipboard?.writeText(url).then(
      () => toast('Job link copied to clipboard'),
      () => toast('Could not copy link', 'info'),
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6">
      {/* Action bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:bg-gray-50"
          aria-label="Back to job list"
        >
          <ArrowLeftIcon />
        </button>
        <span className="rounded-full bg-brand-400 px-4 py-1.5 text-sm font-semibold text-white">{job.applicants} applicants</span>
        <div className="ml-auto flex items-center gap-3">
          <button type="button" onClick={share} className="text-gray-500 transition hover:text-brand-500" aria-label="Copy job link">
            <ExternalIcon />
          </button>
          <button
            type="button"
            onClick={() => onToggleLike(job)}
            aria-pressed={liked}
            aria-label={liked ? 'Remove from liked jobs' : 'Like this job'}
            className={liked ? 'animate-heart text-brand-400' : 'text-gray-500 transition hover:text-brand-400'}
          >
            <HeartIcon filled={liked} />
          </button>
          <button
            type="button"
            disabled={applied}
            onClick={() => onApply(job)}
            className={`hidden items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition sm:flex ${
              applied ? 'cursor-default bg-gray-200 text-gray-500' : 'bg-ink text-white hover:bg-gray-800'
            }`}
          >
            {applied ? 'Applied ✓' : 'Apply Now'}
            {!applied && <ArrowUpRightIcon />}
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          {/* Header */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <CompanyLogo company={job.company} size="lg" />
            <div className="min-w-0 flex-1">
              <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-gray-700">{job.postedAgo}</span>
              <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{job.title}</h1>
              <p className="mt-1 text-gray-400">{job.company.name}</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <PinIcon className="size-4 text-gray-400" />
                  {job.location}
                </span>
                <span className="size-1 rounded-full bg-brand-400" aria-hidden="true" />
                <span>{job.postedAgo}</span>
                <span className="size-1 rounded-full bg-brand-400" aria-hidden="true" />
                <span className="flex items-center gap-1">
                  <BroadcastIcon className="size-4 text-gray-400" />
                  {job.workMode}
                </span>
              </p>
            </div>
            <MatchRing score={job.matchScore} size={92} className="self-center sm:self-start" />
          </div>

          {/* Meta grid */}
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-gray-100 py-5 sm:grid-cols-3">
            {meta.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-700">
                <Icon className="size-4 text-gray-400" />
                {label}
              </div>
            ))}
          </dl>

          {/* Description */}
          <p className="mt-6 leading-relaxed text-gray-700">{job.description}</p>

          {/* Interview banner */}
          <section className="mt-8 rounded-3xl bg-lime-cta p-6 sm:p-8" aria-label="AI mock interview promotion">
            <div className="flex items-start gap-4">
              <RobotIcon className="size-10 text-ink" />
              <div>
                <h2 className="text-xl font-bold">Maximize your interview success</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink/80">
                  Our platform simulates real interview scenarios, helping you refine your responses and boost your confidence.
                </p>
              </div>
            </div>
            <hr className="my-5 border-ink/15" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                {
                  title: 'Job-Specific Simulations:',
                  detail: 'Practice with questions tailored to your target role, ensuring relevance and preparation.',
                },
                {
                  title: 'Actionable Feedback',
                  detail: 'Get detailed analysis of your responses and practical, step-by-step improvement suggestions.',
                },
                {
                  title: 'Boost Success Rates:',
                  detail: 'Perfect your interview skills and increase your chances of landing the job you want.',
                },
              ].map(({ title, detail }) => (
                <div key={title}>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink/75">{detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => toast('AI Mock Interview is coming soon in this demo', 'info')}
                className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Start Interview
              </button>
            </div>
          </section>

          {/* Qualification */}
          <section className="mt-10" aria-labelledby="qualification">
            <h2 id="qualification" className="text-xl font-bold">
              Qualification
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Discover how your skills align with the requirements of this position. Below is a detailed list of the essential
              skills needed for the role.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {job.qualificationTags.map((tag) => (
                <li key={tag} className="rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-700">
                  {tag}
                </li>
              ))}
            </ul>

            <h3 className="mt-6 font-bold">Required</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700">
              {job.required.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>

            <h3 className="mt-6 font-bold">Preferred</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-gray-700">
              {job.preferred.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </section>

          <hr className="my-8 border-gray-100" />

          {/* Responsibilities */}
          <section aria-labelledby="responsibilities">
            <h2 id="responsibilities" className="text-xl font-bold">
              Responsibilities
            </h2>
            <ul className="mt-3 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-gray-700">
              {job.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>

          <hr className="my-8 border-gray-100" />

          {/* Benefits */}
          <section aria-labelledby="benefits">
            <h2 id="benefits" className="text-xl font-bold">
              Benefits
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              We believe happy team members create amazing work. Here’s what we offer to make that happen:
            </p>
            <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-gray-700">
              {job.benefits.map(({ emoji, title, detail }) => (
                <li key={title} className="flex gap-2">
                  <span aria-hidden="true">{emoji}</span>
                  <span>
                    <strong>{title}:</strong> {detail}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="my-8 border-gray-100" />

          {/* Company */}
          <section aria-labelledby="company">
            <h2 id="company" className="text-xl font-bold">
              Company
            </h2>
            <div className="mt-4 rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-4">
                <CompanyLogo company={job.company} size="lg" />
                <div>
                  <h3 className="font-bold">{job.company.name}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                    {[job.company.founded, job.company.location, job.company.size]
                      .filter(Boolean)
                      .map((item, i) => (
                        <span key={item} className="flex items-center gap-2">
                          {i > 0 && <span className="size-0.5 rounded-full bg-gray-400" aria-hidden="true" />}
                          {item}
                        </span>
                      ))}
                    {job.company.website && (
                      <>
                        <span className="size-0.5 rounded-full bg-gray-400" aria-hidden="true" />
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-brand-600 hover:underline"
                        >
                          Website
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
              {job.company.about && <p className="mt-4 text-sm leading-relaxed text-gray-600">{job.company.about}</p>}
            </div>
          </section>
        </main>

        <div className="xl:sticky xl:top-20">
          <FitPanel job={job} plan={plan} onUpgrade={onUpgrade} />
        </div>
      </div>

      {/* Mobile sticky apply bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleLike(job)}
            aria-pressed={liked}
            aria-label={liked ? 'Remove from liked jobs' : 'Like this job'}
            className={`flex size-11 items-center justify-center rounded-full border border-gray-200 ${
              liked ? 'text-brand-400' : 'text-gray-500'
            }`}
          >
            <HeartIcon filled={liked} />
          </button>
          <button
            type="button"
            disabled={applied}
            onClick={() => onApply(job)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold ${
              applied ? 'bg-gray-200 text-gray-500' : 'bg-ink text-white'
            }`}
          >
            {applied ? 'Applied ✓' : 'Apply Now'}
            {!applied && <ArrowUpRightIcon />}
          </button>
        </div>
      </div>
      <div className="h-16 sm:hidden" aria-hidden="true" />
    </div>
  )
}
