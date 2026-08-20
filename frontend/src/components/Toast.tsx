import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'

interface Toast {
  id: number
  message: string
  kind: 'success' | 'info'
}

const ToastContext = createContext<(message: string, kind?: Toast['kind']) => void>(() => {})

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const push = useCallback((message: string, kind: Toast['kind'] = 'success') => {
    const id = nextId.current++
    setToasts((prev) => [...prev, { id, message, kind }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast pointer-events-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-lg ${
              t.kind === 'success' ? 'bg-ink text-lime-cta' : 'bg-ink text-white'
            }`}
          >
            {t.kind === 'success' && (
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="m5 13 4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
