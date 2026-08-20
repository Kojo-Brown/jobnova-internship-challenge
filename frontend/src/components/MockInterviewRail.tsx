import { InterviewIcon, SparkleIcon } from './Icons'
import { useToast } from './Toast'

const reasons = [
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
]

export function MockInterviewRail() {
  const toast = useToast()

  return (
    <aside className="rounded-3xl bg-white p-6 shadow-sm" aria-label="AI mock interview">
      <div className="rounded-2xl bg-gradient-to-br from-brand-50 via-white to-blue-50 p-1">
        <SparkleIcon className="size-7 text-ink" />
        <h2 className="mt-3 text-lg font-bold leading-snug">Ace Your Interviews with AI-Powered Mock Sessions!</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Struggling with interview nerves or unsure how to prepare? Let our cutting-edge AI mock interviews help you shine!
        </p>
      </div>

      <hr className="my-5 border-gray-100" />

      <h3 className="flex items-center gap-1.5 font-bold">
        Why Choose Our AI Mock Interviews?
        <SparkleIcon className="size-4 text-brand-500" />
      </h3>

      <dl className="mt-4 space-y-4">
        {reasons.map(({ title, detail }) => (
          <div key={title}>
            <dt className="text-sm font-bold">{title}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-gray-600">• {detail}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={() => toast('AI Mock Interview is coming soon in this demo', 'info')}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
      >
        <InterviewIcon className="size-4.5" />
        Mock Interview
      </button>
    </aside>
  )
}
