import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import type { Offer } from '@/types/database.types'

function offersKey(restaurantId: string) {
  return ['offers', restaurantId]
}

export type OfferInput = Omit<Offer, 'id' | 'restaurant_id' | 'created_at'>

export function useOffers() {
  const restaurant = useCurrentRestaurant()
  return useQuery({
    queryKey: offersKey(restaurant.id),
    queryFn: async (): Promise<Offer[]> => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('start_date', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCreateOffer() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: OfferInput) => {
      const { error } = await supabase.from('offers').insert({ ...input, restaurant_id: restaurant.id })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: offersKey(restaurant.id) }),
  })
}

export function useUpdateOffer() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<OfferInput> }) => {
      const { error } = await supabase.from('offers').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: offersKey(restaurant.id) }),
  })
}

export function useDeleteOffer() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('offers').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: offersKey(restaurant.id) }),
  })
}
