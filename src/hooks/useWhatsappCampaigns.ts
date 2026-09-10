import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import type { WhatsappCampaign } from '@/types/database.types'

function campaignsKey(restaurantId: string) {
  return ['whatsapp-campaigns', restaurantId]
}

export function useWhatsappCampaigns() {
  const restaurant = useCurrentRestaurant()
  return useQuery({
    queryKey: campaignsKey(restaurant.id),
    queryFn: async (): Promise<WhatsappCampaign[]> => {
      const { data, error } = await supabase
        .from('whatsapp_campaigns')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useSendWhatsappCampaign() {
  const restaurant = useCurrentRestaurant()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ message, targetSegment }: { message: string; targetSegment: string }) => {
      const { data: campaign, error } = await supabase
        .from('whatsapp_campaigns')
        .insert({ restaurant_id: restaurant.id, message, target_segment: targetSegment })
        .select()
        .single()
      if (error) throw error

      const { error: fnError } = await supabase.functions.invoke('send-whatsapp-campaign', {
        body: { campaignId: campaign.id },
      })
      if (fnError) throw fnError
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: campaignsKey(restaurant.id) }),
  })
}
