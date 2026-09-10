import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import type { PlanType, Subscription } from '@/types/database.types'

export function useSubscription() {
  const restaurant = useCurrentRestaurant()
  return useQuery({
    queryKey: ['subscription', restaurant.id],
    queryFn: async (): Promise<Subscription | null> => {
      const { data, error } = await supabase.from('subscriptions').select('*').eq('restaurant_id', restaurant.id).maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useCreateCheckoutSession() {
  return useMutation({
    mutationFn: async (plan: Extract<PlanType, 'pro' | 'annual'>) => {
      const { data, error } = await supabase.functions.invoke<{ url: string; error?: string }>('create-checkout-session', {
        body: { plan },
      })
      if (error) throw error
      if (!data?.url) throw new Error(data?.error ?? 'CHECKOUT_FAILED')
      return data.url
    },
  })
}

export function useBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke<{ url: string; error?: string }>('billing-portal', { body: {} })
      if (error) throw error
      if (!data?.url) throw new Error(data?.error ?? 'PORTAL_FAILED')
      return data.url
    },
  })
}
