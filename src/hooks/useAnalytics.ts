import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import type { AnalyticsEvent } from '@/types/database.types'

export function useAnalyticsEvents(days: number) {
  const restaurant = useCurrentRestaurant()
  return useQuery({
    queryKey: ['analytics-events', restaurant.id, days],
    queryFn: async (): Promise<AnalyticsEvent[]> => {
      const since = new Date()
      since.setDate(since.getDate() - days)
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .gte('created_at', since.toISOString())
        .order('created_at')
      if (error) throw error
      return data
    },
  })
}

export interface DailyEventCount {
  date: string
  qr_scan: number
  link_click: number
}

export function buildDailySeries(events: AnalyticsEvent[], days: number): DailyEventCount[] {
  const series: DailyEventCount[] = []
  const byDate = new Map<string, DailyEventCount>()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const entry = { date: key, qr_scan: 0, link_click: 0 }
    series.push(entry)
    byDate.set(key, entry)
  }

  for (const event of events) {
    const key = event.created_at.slice(0, 10)
    const entry = byDate.get(key)
    if (entry) entry[event.event_type] += 1
  }

  return series
}
