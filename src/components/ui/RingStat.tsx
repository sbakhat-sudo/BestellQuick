import { type ReactNode, useEffect, useState } from 'react'

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
  const gradientId = `ring-gradient-${colorFrom.replace('#', '')}-${colorTo.replace('#', '')}`

  // Starts at 0% and animates to the real value once mounted, so the ring
  // visibly fills in rather than appearing already at its final state.
  const [animatedPercent, setAnimatedPercent] = useState(0)
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedPercent(clamped))
    return () => cancelAnimationFrame(raf)
  }, [clamped])

  const offset = CIRCUMFERENCE - (animatedPercent / 100) * CIRCUMFERENCE

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
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span aria-hidden="true">{icon}</span>
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{Math.round(clamped)}%</span>
      </div>
    </div>
  )
}
