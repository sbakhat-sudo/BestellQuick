import type { ReactNode } from 'react'

interface RingStatProps {
  percent: number
  icon: ReactNode
  colorFrom: string
  colorTo: string
  trackColor?: string
}

const SIZE = 96
const STROKE = 8
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function RingStat({ percent, icon, colorFrom, colorTo, trackColor = 'var(--ring-track-color, #e5e5e5)' }: RingStatProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE
  const gradientId = `ring-gradient-${colorFrom.replace('#', '')}-${colorTo.replace('#', '')}`

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
        </defs>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke={trackColor} strokeWidth={STROKE} />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span aria-hidden="true">{icon}</span>
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{Math.round(clamped)}%</span>
      </div>
    </div>
  )
}
