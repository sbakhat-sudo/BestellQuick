import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { RESTAURANT_QUERY_KEY } from './useRestaurant'
import type { Restaurant } from '@/types/database.types'

export function useUpdateRestaurant() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: Partial<Omit<Restaurant, 'id' | 'owner_user_id' | 'created_at' | 'slug'>>) => {
      const { data, error } = await supabase.from('restaurants').update(patch).eq('id', restaurant.id).select().single()
      if (error) throw error
      return data as Restaurant
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANT_QUERY_KEY })
    },
  })
}
