// Hand-written types mirroring supabase/migrations/*.sql.
// Regenerate with `supabase gen types typescript` against a live project
// once one is provisioned, and this file can be replaced wholesale.

export type PlanType = 'free' | 'pro' | 'annual'
export type MenuItemStatus = 'available' | 'out_of_stock'
export type OrderType = 'dine_in' | 'delivery'
export type AccessSource = 'qr' | 'link'
export type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered'
export type CommissionType = 'fixed' | 'percentage' | 'distance'
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
export type AnalyticsEventType = 'qr_scan' | 'link_click'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'

export interface Restaurant {
  id: string
  owner_user_id: string
  name: string
  slug: string
  logo_url: string | null
  cover_photo_url: string | null
  address: string | null
  phone: string | null
  email: string | null
  is_open: boolean
  plan: PlanType
  delivery_commission_type: CommissionType
  delivery_commission_value: number
  created_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  price: number
  photo_url: string | null
  category: string
  status: MenuItemStatus
  created_at: string
}

export interface Order {
  id: string
  restaurant_id: string
  customer_name: string
  customer_phone: string
  order_type: OrderType
  access_source: AccessSource
  status: OrderStatus
  total_price: number
  created_at: string
  updated_at: string
}

export interface OrderTrackingPublic {
  id: string
  restaurant_id: string
  order_type: OrderType
  status: OrderStatus
  total_price: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  quantity: number
  unit_price: number
}

export interface Offer {
  id: string
  restaurant_id: string
  title: string
  description: string | null
  photo_url: string | null
  price: number | null
  start_date: string
  end_date: string | null
  created_at: string
}

export interface DeliveryDriver {
  id: string
  restaurant_id: string
  name: string
  phone: string
  is_active: boolean
}

export interface Delivery {
  id: string
  order_id: string
  driver_id: string | null
  commission_type: CommissionType
  commission_amount: number
  status: DeliveryStatus
}

export interface DeliveryTrackingPublic {
  order_id: string
  status: DeliveryStatus
  driver_name: string | null
  driver_phone: string | null
}

export interface AnalyticsEvent {
  id: string
  restaurant_id: string
  event_type: AnalyticsEventType
  created_at: string
}

export interface WhatsappCampaign {
  id: string
  restaurant_id: string
  message: string
  target_segment: string
  sent_at: string | null
  recipients_count: number
  created_at: string
}

export interface Subscription {
  id: string
  restaurant_id: string
  plan: PlanType
  status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_end: string | null
  created_at: string
}

export interface CartItemInput {
  menu_item_id: string
  quantity: number
}
