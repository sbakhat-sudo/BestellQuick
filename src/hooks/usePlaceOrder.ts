import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AccessSource, CartItemInput, Order, OrderType } from '@/types/database.types'

interface PlaceOrderInput {
  restaurantId: string
  customerName: string
  customerPhone: string
  orderType: OrderType
  accessSource: AccessSource
  items: CartItemInput[]
}

export class PlaceOrderError extends Error {
  code: string
  constructor(code: string) {
    super(code)
    this.code = code
  }
}

export function usePlaceOrder() {
  return useMutation({
    mutationFn: async (input: PlaceOrderInput): Promise<Order> => {
      const { data, error } = await supabase.rpc('create_order', {
        p_restaurant_id: input.restaurantId,
        p_customer_name: input.customerName,
        p_customer_phone: input.customerPhone,
        p_order_type: input.orderType,
        p_access_source: input.accessSource,
        p_items: input.items,
      })
      if (error) {
        throw new PlaceOrderError(error.message.includes('PLAN_LIMIT_REACHED') ? 'PLAN_LIMIT_REACHED' : error.message)
      }
      return data as Order
    },
  })
}
