import type { Tab } from '../types'
import { BoltIcon, MenuIcon } from './Icons'

interface TopNavProps {
  tab: Tab
  onTabChange: (tab: Tab) => void
  likedCount: number
  appliedCount: number
  onOpenMenu: () => void
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'matched', label: 'Matched' },
  { id: 'liked', label: 'Liked' },
  { id: 'applied', label: 'Applied' },
]

export function TopNav({ tab, onTabChange, likedCount, appliedCount, onOpenMenu }: TopNavProps) {
  const counts: Record<Tab, number | null> = { matched: null, liked: likedCount, applied: appliedCount }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open navigation menu"
        >
          <MenuIcon />
        </button>

        <a href="#/" className="flex items-center gap-2" aria-label="JobNova home">
          <span className="flex size-9 items-center justify-center rounded-xl bg-ink">
            <BoltIcon className="size-5 text-brand-400" />
          </span>
          <span className="hidden text-xl font-extrabold tracking-tight min-[420px]:inline">JobNova</span>
        </a>

        <nav className="ml-1 flex min-w-0 flex-1 items-center justify-center gap-0 overflow-x-auto sm:ml-2 sm:gap-2" aria-label="Job lists">
          {tabs.map(({ id, label }, i) => {
            const active = tab === id
            const count = counts[id]
            return (
              <span key={id} className="flex items-center">
                {i > 0 && <span className="mx-1 hidden h-6 w-px bg-gray-200 sm:mx-3 sm:inline-block" aria-hidden="true" />}
                <button
                  type="button"
                  onClick={() => onTabChange(id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-semibold transition sm:px-5 sm:py-2 ${
                    active
                      ? 'border-2 border-brand-400 text-ink'
                      : 'border-2 border-transparent text-gray-500 hover:text-ink'
                  }`}
                >
                  {label}
                  {count !== null && count > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-lime-ring text-xs font-bold text-ink">
                      {count}
                    </span>
                  )}
                </button>
              </span>
            )
          })}
        </nav>

        <span className="hidden size-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600 sm:flex" aria-hidden="true">
          K
        </span>
      </div>
    </header>
  )
}
