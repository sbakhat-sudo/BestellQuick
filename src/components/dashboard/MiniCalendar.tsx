import { useMemo } from 'react'
import {
  addDays,
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

export function MiniCalendar() {
  const today = new Date()

  const days = useMemo(() => {
    const monthStart = startOfMonth(today)
    const monthEnd = endOfMonth(today)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const result: Date[] = []
    let day = gridStart
    while (day <= gridEnd) {
      result.push(day)
      day = addDays(day, 1)
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <p className="mb-3 text-sm font-medium capitalize text-neutral-700">{format(today, 'MMMM yyyy', { locale: fr })}</p>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="font-medium text-neutral-400">
            {label}
          </span>
        ))}
        {days.map((day) => (
          <span
            key={day.toISOString()}
            className={clsx(
              'mx-auto flex size-7 items-center justify-center rounded-full',
              isSameDay(day, today)
                ? 'bg-brand-600 font-semibold text-white'
                : isSameMonth(day, today)
                  ? 'text-neutral-700'
                  : 'text-neutral-300',
            )}
          >
            {format(day, 'd')}
          </span>
        ))}
      </div>
    </div>
  )
}
