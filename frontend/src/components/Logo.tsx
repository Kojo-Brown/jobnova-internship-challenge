/**
 * JobNova brand mark (from the Figma design): a dark rounded-square tile with
 * concentric radar rings spiralling from the lower-left and a lime lightning
 * bolt on top — "AI signal + fast opportunity".
 */
export function JobNovaMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="JobNova logo">
      <rect width="40" height="40" rx="11" fill="#22293a" />
      {/* radar rings emanating from the lower-left corner */}
      <g fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round">
        <path d="M7 33.5a2.5 2.5 0 0 1 2.5-2.5" />
        <path d="M7 27.5A8 8 0 0 1 15 35.5" opacity="0.95" />
        <path d="M7 21.5A14 14 0 0 1 21 35.5" opacity="0.85" />
        <path d="M7 15.5A20 20 0 0 1 27 35.5" opacity="0.7" />
      </g>
      {/* lightning bolt */}
      <path
        d="M22 8 12.5 22.2h5.4L15.5 33 26 18.4h-5.6L22 8Z"
        fill="#c3f53c"
        stroke="#22293a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
