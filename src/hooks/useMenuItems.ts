import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import type { MenuItem } from '@/types/database.types'

function menuItemsKey(restaurantId: string) {
  return ['menu-items', restaurantId]
}

export function useMenuItems(restaurantId?: string) {
  const restaurant = useCurrentRestaurant()
  const id = restaurantId ?? restaurant.id

  return useQuery({
    queryKey: menuItemsKey(id),
    queryFn: async (): Promise<MenuItem[]> => {
      const { data, error } = await supabase.from('menu_items').select('*').eq('restaurant_id', id).order('category').order('name')
      if (error) throw error
      return data
    },
  })
}

export type MenuItemInput = Omit<MenuItem, 'id' | 'restaurant_id' | 'created_at'>

export function useCreateMenuItem() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: MenuItemInput) => {
      const { error } = await supabase.from('menu_items').insert({ ...input, restaurant_id: restaurant.id })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: menuItemsKey(restaurant.id) }),
  })
}

export function useUpdateMenuItem() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<MenuItemInput> }) => {
      const { error } = await supabase.from('menu_items').update(patch).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: menuItemsKey(restaurant.id) }),
  })
}

export function useDeleteMenuItem() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('menu_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: menuItemsKey(restaurant.id) }),
  })
}
