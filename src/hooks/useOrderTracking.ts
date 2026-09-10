import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { DeliveryTrackingPublic, Order } from '@/types/database.types'

function orderTrackingKey(orderId: string) {
  return ['order-tracking', orderId]
}

export function useOrderTracking(orderId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: orderTrackingKey(orderId ?? ''),
    queryFn: async (): Promise<Order> => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single()
      if (error) throw error
      return data
    },
    enabled: !!orderId,
  })

  useEffect(() => {
    if (!orderId) return
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          queryClient.setQueryData(orderTrackingKey(orderId), payload.new as Order)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId, queryClient])

  return query
}

export function useDeliveryTracking(orderId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['delivery-tracking', orderId],
    queryFn: async (): Promise<DeliveryTrackingPublic | null> => {
      const { data, error } = await supabase.from('delivery_tracking_public').select('*').eq('order_id', orderId).maybeSingle()
      if (error) throw error
      return data
    },
    enabled: enabled && !!orderId,
  })
}
