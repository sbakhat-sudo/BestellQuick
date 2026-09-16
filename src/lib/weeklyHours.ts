import type { WeekdayKey, WeeklyHours } from '@/types/database.types'

export const WEEKDAY_ORDER: WeekdayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export const DEFAULT_WEEKLY_HOURS: WeeklyHours = {
  mon: { enabled: true, open: '09:00', close: '22:00' },
  tue: { enabled: true, open: '09:00', close: '22:00' },
  wed: { enabled: true, open: '09:00', close: '22:00' },
  thu: { enabled: true, open: '09:00', close: '22:00' },
  fri: { enabled: true, open: '09:00', close: '22:00' },
  sat: { enabled: true, open: '09:00', close: '22:00' },
  sun: { enabled: false, open: '09:00', close: '22:00' },
}
