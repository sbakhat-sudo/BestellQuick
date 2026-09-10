import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import type { OrderStatus } from '@/types/database.types'

export interface OrderWithItems {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  order_type: 'dine_in' | 'delivery'
  access_source: 'qr' | 'link'
  status: OrderStatus
  total_price: number
  created_at: string
  updated_at: string
  order_items: { quantity: number; unit_price: number; menu_items: { name: string } | null }[]
  deliveries: { id: string; status: string; driver_id: string | null; commission_amount: number }[] | null
}

export function ordersQueryKey(restaurantId: string) {
  return ['orders', restaurantId]
}

export function useOrders() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ordersQueryKey(restaurant.id),
    queryFn: async (): Promise<OrderWithItems[]> => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(quantity, unit_price, menu_items(name)), deliveries(id, status, driver_id, commission_amount)')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as OrderWithItems[]
    },
  })

  useEffect(() => {
    const channel = supabase
      .channel(`orders-dashboard-${restaurant.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ordersQueryKey(restaurant.id) })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant.id])

  return query
}

const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  confirmed: 'preparing',
  preparing: 'ready',
  ready: null, // branches to out_for_delivery for delivery orders (handled in UI)
  out_for_delivery: 'delivered',
  delivered: null,
}

export function nextOrderStatus(current: OrderStatus, orderType: 'dine_in' | 'delivery'): OrderStatus | null {
  if (current === 'ready' && orderType === 'delivery') return 'out_for_delivery'
  if (current === 'ready' && orderType === 'dine_in') return 'delivered'
  return STATUS_FLOW[current]
}

export function useUpdateOrderStatus() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey(restaurant.id) })
    },
  })
}
