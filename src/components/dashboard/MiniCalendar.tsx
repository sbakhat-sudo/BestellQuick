import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import clsx from 'clsx'

const WEEKDAY_LABELS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

interface MiniCalendarProps {
  onSelectDay?: (day: Date) => void
}

export function MiniCalendar({ onSelectDay }: MiniCalendarProps) {
  const today = new Date()
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(today))

  const days = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth)
    const monthEnd = endOfMonth(visibleMonth)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const result: Date[] = []
    let day = gridStart
    while (day <= gridEnd) {
      result.push(day)
      day = addDays(day, 1)
    }
    return result
  }, [visibleMonth])

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
          className="flex size-6 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          aria-label="Mois précédent"
        >
          ‹
        </button>
        <p className="text-sm font-medium capitalize text-neutral-700">{format(visibleMonth, 'MMMM yyyy', { locale: fr })}</p>
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
          className="flex size-6 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100"
          aria-label="Mois suivant"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="font-medium text-neutral-400">
            {label}
          </span>
        ))}
        {days.map((day) => (
          <button
            key={day.toISOString()}
            type="button"
            onClick={() => onSelectDay?.(day)}
            className={clsx(
              'mx-auto flex size-7 items-center justify-center rounded-full transition-colors',
              isSameDay(day, today)
                ? 'bg-brand-600 font-semibold text-white'
                : isSameMonth(day, visibleMonth)
                  ? 'text-neutral-700 hover:bg-neutral-100'
                  : 'text-neutral-300 hover:bg-neutral-50',
            )}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  )
}
