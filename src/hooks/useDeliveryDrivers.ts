import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import type { DeliveryDriver } from '@/types/database.types'
import { ordersQueryKey } from './useOrders'

function driversKey(restaurantId: string) {
  return ['delivery-drivers', restaurantId]
}

export function useDeliveryDrivers() {
  const restaurant = useCurrentRestaurant()
  return useQuery({
    queryKey: driversKey(restaurant.id),
    queryFn: async (): Promise<DeliveryDriver[]> => {
      const { data, error } = await supabase.from('delivery_drivers').select('*').eq('restaurant_id', restaurant.id).order('name')
      if (error) throw error
      return data
    },
  })
}

export function useCreateDeliveryDriver() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; phone: string }) => {
      const { error } = await supabase.from('delivery_drivers').insert({ ...input, restaurant_id: restaurant.id })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: driversKey(restaurant.id) }),
  })
}

export function useUpdateDeliveryDriver() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Pick<DeliveryDriver, 'name' | 'phone' | 'is_active'>> }) => {
      const { error } = await supabase.from('delivery_drivers').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: driversKey(restaurant.id) }),
  })
}

export function useDeleteDeliveryDriver() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('delivery_drivers').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: driversKey(restaurant.id) }),
  })
}

export function useAssignDelivery() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, driverId, distanceKm }: { orderId: string; driverId: string; distanceKm?: number }) => {
      const { error } = await supabase.rpc('assign_delivery', {
        p_order_id: orderId,
        p_driver_id: driverId,
        p_distance_km: distanceKm ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ordersQueryKey(restaurant.id) }),
  })
}
