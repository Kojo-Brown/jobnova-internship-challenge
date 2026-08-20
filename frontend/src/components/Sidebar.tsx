import type { Plan } from '../types'
import {
  BriefcaseIcon,
  CloseIcon,
  CreditsIcon,
  InterviewIcon,
  ProfileIcon,
  ResumeIcon,
  SettingIcon,
  SubscriptionIcon,
} from './Icons'
import { useToast } from './Toast'

interface SidebarProps {
  plan: Plan
  onUpgrade: () => void
  /** mobile drawer state */
  open: boolean
  onClose: () => void
}

const groups = [
  [
    { label: 'Jobs', icon: BriefcaseIcon, active: true },
    { label: 'AI Mock Interview', icon: InterviewIcon, active: false },
    { label: 'Resume', icon: ResumeIcon, active: false },
  ],
  [
    { label: 'Profile', icon: ProfileIcon, active: false },
    { label: 'Setting', icon: SettingIcon, active: false },
  ],
  [
    { label: 'Subscription', icon: SubscriptionIcon, active: false },
    { label: 'Extra Credits', icon: CreditsIcon, active: false },
  ],
]

function SidebarContent({ plan, onUpgrade }: Pick<SidebarProps, 'plan' | 'onUpgrade'>) {
  const toast = useToast()

  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto p-4">
      <nav aria-label="Main navigation">
        {groups.map((items, gi) => (
          <div key={gi}>
            {gi > 0 && <hr className="my-3 border-gray-100" />}
            <ul className="space-y-1">
              {items.map(({ label, icon: Icon, active }) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!active) toast(`${label} is coming soon in this demo`, 'info')
                    }}
                    aria-current={active ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      active
                        ? 'bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-md shadow-brand-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="size-4.5" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-400 to-brand-300 p-5 text-white">
        {plan === 'free' ? (
          <>
            <p className="text-lg font-bold leading-snug">Upgrade Your Plan</p>
            <p className="mt-1 text-sm text-white/85">Boost your success rate now!</p>
            <button
              type="button"
              onClick={onUpgrade}
              className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-semibold text-ink transition hover:bg-brand-50"
            >
              Subscription
            </button>
          </>
        ) : (
          <>
            <p className="text-lg font-bold leading-snug">Pro Plan Active ✨</p>
            <p className="mt-1 text-sm text-white/85">Full match insights unlocked.</p>
          </>
        )}
      </div>
    </div>
  )
}

export function Sidebar({ plan, onUpgrade, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 border-r border-gray-100 bg-white lg:block">
        <SidebarContent plan={plan} onUpgrade={onUpgrade} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close menu" />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <span className="font-bold">Menu</span>
              <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100" aria-label="Close menu">
                <CloseIcon className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent plan={plan} onUpgrade={onUpgrade} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
