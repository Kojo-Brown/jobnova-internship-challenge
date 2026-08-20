interface IconProps {
  className?: string
}

const base = 'shrink-0'

export function BriefcaseIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2.5" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3 12h18" />
    </svg>
  )
}

export function InterviewIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <rect x="3" y="5" width="18" height="13" rx="2.5" />
      <path d="M9 21h6M7.5 9.5h4M7.5 13h7" />
    </svg>
  )
}

export function ResumeIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <path d="M6 3.5h8.5L19 8v12.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4.5M8.5 12h7M8.5 15.5h7" />
    </svg>
  )
}

export function ProfileIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-3.2 3.8-4.8 7-4.8s5.8 1.6 7 4.8" />
    </svg>
  )
}

export function SettingIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z" />
    </svg>
  )
}

export function SubscriptionIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-4.7-3-1.8 1.2L10.2 20l-4.7 1.5v-17a1 1 0 0 1 1-1Z" />
      <path d="m12 7.5 1.1 2.2 2.4.35-1.75 1.7.4 2.4L12 13l-2.15 1.15.4-2.4-1.75-1.7 2.4-.35L12 7.5Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function CreditsIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function PinIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.8" r="2.3" />
    </svg>
  )
}

export function BroadcastIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <path d="M4.5 19.5a4 4 0 0 1 4-4M4.5 14a9.5 9.5 0 0 1 9.5 9.5M4.5 8.5A15 15 0 0 1 19.5 23.5" transform="translate(0 -4)" />
      <circle cx="5.5" cy="18.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function HeartIcon({ className = 'size-5', filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      className={`${base} ${className}`}
      aria-hidden="true"
    >
      <path d="M12 20.5s-7.5-4.7-9.3-9.4C1.4 7.6 3.7 4.5 7 4.5c2 0 3.9 1.1 5 2.9 1.1-1.8 3-2.9 5-2.9 3.3 0 5.6 3.1 4.3 6.6-1.8 4.7-9.3 9.4-9.3 9.4Z" />
    </svg>
  )
}

export function LinkIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <path d="M10.5 13.5a4 4 0 0 0 5.7 0l3.2-3.2a4 4 0 1 0-5.7-5.7l-1.4 1.5" />
      <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-3.2 3.2a4 4 0 1 0 5.7 5.7l1.4-1.5" />
    </svg>
  )
}

export function ExternalIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <path d="M14 4.5h5.5V10M19.5 4.5 11 13M9 6H5.5A1.5 1.5 0 0 0 4 7.5v11A1.5 1.5 0 0 0 5.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15" />
    </svg>
  )
}

export function ArrowLeftIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${base} ${className}`} aria-hidden="true">
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
    </svg>
  )
}

export function ArrowUpRightIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${base} ${className}`} aria-hidden="true">
      <path d="M7 17 17 7m0 0H8m9 0v9" />
    </svg>
  )
}

export function SearchIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  )
}

export function RefreshIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <path d="M4 10a8 8 0 0 1 13.7-3.7L20 8.5M20 4v4.5h-4.5M20 14a8 8 0 0 1-13.7 3.7L4 15.5M4 20v-4.5h4.5" />
    </svg>
  )
}

export function SparkleIcon({ className = 'size-5' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${base} ${className}`} aria-hidden="true">
      <path d="M12 2.5 13.8 8 19.5 10 13.8 12 12 17.5 10.2 12 4.5 10 10.2 8 12 2.5Z" />
      <path d="M19 14.5l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
    </svg>
  )
}

export function RobotIcon({ className = 'size-8' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <rect x="5" y="8" width="14" height="10" rx="3" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="12.5" r="1.3" fill="#c3f53c" stroke="none" />
      <circle cx="14.5" cy="12.5" r="1.3" fill="#c3f53c" stroke="none" />
      <path d="M12 8V5.5M12 5.5a1.3 1.3 0 1 0-.01-2.6A1.3 1.3 0 0 0 12 5.5ZM7 8 5.5 6.5M17 8l1.5-1.5" />
    </svg>
  )
}

export function CheckBadgeIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${base} ${className}`} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#22c55e" />
      <path d="m8 12.2 2.6 2.6L16.2 9" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WarnBadgeIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${base} ${className}`} aria-hidden="true">
      <path d="M12 3 22 20H2L12 3Z" fill="#fbbf24" />
      <path d="M12 9.5v4.5" stroke="#7c5203" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="1" fill="#7c5203" />
    </svg>
  )
}

export function MenuIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${base} ${className}`} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CloseIcon({ className = 'size-6' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`${base} ${className}`} aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export function BoltIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${base} ${className}`} aria-hidden="true">
      <path d="M13.5 2 5 13.5h5L9 22l8.5-11.5h-5L13.5 2Z" />
    </svg>
  )
}

export function LockIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V8a4 4 0 1 1 8 0v2.5" />
    </svg>
  )
}

export function ClockIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function LevelIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <path d="M5 20v-6M12 20V10M19 20V4" strokeLinecap="round" />
    </svg>
  )
}

export function SalaryIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <ellipse cx="12" cy="6" rx="7.5" ry="2.8" />
      <path d="M4.5 6v6c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8V6M4.5 12v6c0 1.55 3.36 2.8 7.5 2.8s7.5-1.25 7.5-2.8v-6" />
    </svg>
  )
}

export function LaptopIcon({ className = 'size-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={`${base} ${className}`} aria-hidden="true">
      <rect x="4.5" y="5" width="15" height="10" rx="1.5" />
      <path d="M2.5 18.5h19" strokeLinecap="round" />
    </svg>
  )
}
