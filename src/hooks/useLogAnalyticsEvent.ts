import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { AnalyticsEventType } from '@/types/database.types'

export function useLogAnalyticsEvent(restaurantId: string | undefined, eventType: AnalyticsEventType) {
  const logged = useRef(false)

  useEffect(() => {
    if (!restaurantId || logged.current) return
    logged.current = true
    supabase.rpc('log_analytics_event', { p_restaurant_id: restaurantId, p_event_type: eventType })
  }, [restaurantId, eventType])
}
