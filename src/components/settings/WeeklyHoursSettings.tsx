import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { useUpdateRestaurant } from '@/hooks/useUpdateRestaurant'
import { WEEKDAY_ORDER, DEFAULT_WEEKLY_HOURS } from '@/lib/weeklyHours'
import { getErrorMessage } from '@/lib/errors'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import type { WeeklyHours } from '@/types/database.types'

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5 text-brand-600 dark:text-brand-400" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WeeklyHoursSettings() {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const updateRestaurant = useUpdateRestaurant()

  const [hours, setHours] = useState<WeeklyHours>(restaurant.weekly_hours ?? DEFAULT_WEEKLY_HOURS)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setDay = (day: keyof WeeklyHours, patch: Partial<WeeklyHours[keyof WeeklyHours]>) => {
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }))
    setSaved(false)
  }

  const applyMondayToAll = () => {
    const monday = hours.mon
    setHours((prev) => {
      const next = { ...prev }
      for (const day of WEEKDAY_ORDER) {
        next[day] = { ...next[day], open: monday.open, close: monday.close }
      }
      return next
    })
    setSaved(false)
  }

  const onSave = async () => {
    setError(null)
    try {
      await updateRestaurant.mutateAsync({ weekly_hours: hours })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to save weekly hours:', err)
      setError(getErrorMessage(err, t('common.error')))
    }
  }

  return (
    <Card className="animate-fade-in-up">
      <CardHeader className="flex items-center gap-2">
        <ClockIcon />
        <div>
          <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">{t('settings.weeklyHoursTitle')}</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{t('settings.weeklyHoursDesc')}</p>
        </div>
      </CardHeader>
      <CardBody className="flex flex-col gap-1">
        {WEEKDAY_ORDER.map((day) => {
          const d = hours[day]
          return (
            <div
              key={day}
              className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
            >
              <div className="flex w-36 shrink-0 items-center gap-2.5">
                <Toggle checked={d.enabled} onChange={(checked) => setDay(day, { enabled: checked })} label={t(`settings.weekday.${day}`)} hideLabel />
                <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{t(`settings.weekday.${day}`)}</span>
              </div>

              <div
                className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ease-out ${
                  d.enabled ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0'
                }`}
              >
                <Input
                  type="time"
                  aria-label={t('settings.openTime')}
                  value={d.open}
                  onChange={(e) => setDay(day, { open: e.target.value })}
                  className="w-32"
                />
                <span className="text-neutral-400">–</span>
                <Input
                  type="time"
                  aria-label={t('settings.closeTime')}
                  value={d.close}
                  onChange={(e) => setDay(day, { close: e.target.value })}
                  className="w-32"
                />
              </div>

              {!d.enabled && <span className="text-sm italic text-neutral-400 dark:text-neutral-500">{t('settings.closedThisDay')}</span>}

              {day === 'mon' && (
                <button
                  type="button"
                  onClick={applyMondayToAll}
                  className="ms-auto text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400"
                >
                  {t('settings.applyToAllDays')}
                </button>
              )}
            </div>
          )
        })}

        {error && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3">
          <Button onClick={onSave} isLoading={updateRestaurant.isPending}>
            {t('common.save')}
          </Button>
          {saved && <span className="animate-fade-in text-sm font-medium text-brand-600 dark:text-brand-400">✓ {t('common.saved')}</span>}
        </div>
      </CardBody>
    </Card>
  )
}
