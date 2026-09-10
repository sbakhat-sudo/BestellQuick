import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { MenuItem, Offer, Restaurant } from '@/types/database.types'

export function usePublicRestaurant(slug: string | undefined) {
  return useQuery({
    queryKey: ['public-restaurant', slug],
    queryFn: async (): Promise<Restaurant | null> => {
      const { data, error } = await supabase.from('restaurants').select('*').eq('slug', slug).maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!slug,
  })
}

export function usePublicMenuItems(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['public-menu-items', restaurantId],
    queryFn: async (): Promise<MenuItem[]> => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('category')
        .order('name')
      if (error) throw error
      return data
    },
    enabled: !!restaurantId,
  })
}

export function usePublicOffers(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['public-offers', restaurantId],
    queryFn: async (): Promise<Offer[]> => {
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .lte('start_date', today)
        .or(`end_date.is.null,end_date.gte.${today}`)
        .order('start_date')
      if (error) throw error
      return data
    },
    enabled: !!restaurantId,
  })
}
