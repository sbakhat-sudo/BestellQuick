import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Restaurant } from '@/types/database.types'
import { slugify, withRandomSuffix } from '@/lib/slug'

export const RESTAURANT_QUERY_KEY = ['restaurant', 'mine']

export function useRestaurant() {
  const { user } = useAuth()

  return useQuery({
    queryKey: [...RESTAURANT_QUERY_KEY, user?.id],
    queryFn: async (): Promise<Restaurant | null> => {
      const { data, error } = await supabase.from('restaurants').select('*').eq('owner_user_id', user!.id).maybeSingle()
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useOnboardRestaurant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (name: string) => {
      const baseSlug = slugify(name) || 'restaurant'
      let slug = baseSlug

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase.rpc('onboard_restaurant', { p_name: name, p_slug: slug })
        if (!error) return data as Restaurant
        // 23505 = unique_violation on the slug column, try a random suffix
        if (error.code === '23505') {
          slug = withRandomSuffix(baseSlug)
          continue
        }
        throw error
      }
      throw new Error('SLUG_GENERATION_FAILED')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESTAURANT_QUERY_KEY })
    },
  })
}
