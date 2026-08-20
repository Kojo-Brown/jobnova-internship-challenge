/** Color-code a match score the way the design does: lime for strong,
 * yellow-green for good, amber for moderate. */
// eslint-disable-next-line react-refresh/only-export-components
export function ringColor(score: number): string {
  if (score >= 90) return '#a3e635'
  if (score >= 75) return '#bdd932'
  return '#fbbf24'
}

interface MatchRingProps {
  score: number
  /** outer diameter in px */
  size?: number
  strokeWidth?: number
  className?: string
}

export function MatchRing({ score, size = 84, strokeWidth = 8, className = '' }: MatchRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, score))
  const offset = circumference * (1 - clamped / 100)
  const color = ringColor(clamped)

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${clamped}% match`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#efeff3" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="animate-ring"
          style={{ '--ring-circumference': `${circumference}` } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-bold" style={{ fontSize: size * 0.24 }}>
          {clamped}%
        </span>
        <span className="text-gray-500" style={{ fontSize: size * 0.14 }}>
          Match
        </span>
      </div>
    </div>
  )
}
