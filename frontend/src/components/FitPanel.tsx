import type { Job, Plan } from '../types'
import { CheckBadgeIcon, WarnBadgeIcon } from './Icons'

function MiniRing({ score, label }: { score: number; label: string }) {
  const size = 56
  const strokeWidth = 5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100)

  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-100 bg-white px-3 py-3">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${score}%`}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#efeff3" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="animate-ring"
            style={{ '--ring-circumference': `${circumference}` } as React.CSSProperties}
          />
        </svg>
        <span className="absolute text-sm font-bold">{score}%</span>
      </div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  )
}

export function FitPanel({ job, plan, onUpgrade }: { job: Job; plan: Plan; onUpgrade: () => void }) {
  const locked = plan === 'free'

  return (
    <aside
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-brand-50 to-blue-50 p-5 shadow-sm"
      aria-label="Job fit analysis"
    >
      <h2 className="text-base font-bold">Why is this job a good fit for me?</h2>

      <div className={locked ? 'pointer-events-none select-none blur-md' : ''} aria-hidden={locked}>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {job.fit.criteria.map((c) => (
            <MiniRing key={c.label} score={c.score} label={c.label} />
          ))}
        </div>

        <div className="mt-5 space-y-5">
          {job.fit.notes.map((note) => (
            <section key={note.title}>
              <h3 className="flex items-center gap-1.5 text-sm font-bold">
                {note.title}
                {note.status === 'ok' ? <CheckBadgeIcon /> : <WarnBadgeIcon />}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600">• {note.detail}</p>
            </section>
          ))}
        </div>
      </div>

      {locked && (
        <div className="absolute inset-x-0 bottom-8 flex justify-center">
          <button
            type="button"
            onClick={onUpgrade}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gray-800"
          >
            Upgrade to check
          </button>
        </div>
      )}
    </aside>
  )
}
