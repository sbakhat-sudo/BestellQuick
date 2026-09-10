import type { PlanType } from '@/types/database.types'

// Business defaults not specified by the brief — documented here so they
// are easy to find and tweak in one place.
export const PLAN_LIMITS: Record<PlanType, { monthlyOrders: number | null; priceLabel: string }> = {
  free: { monthlyOrders: 100, priceLabel: '0 €' },
  pro: { monthlyOrders: null, priceLabel: '9,90 €/mois' },
  annual: { monthlyOrders: null, priceLabel: '89 €/an' },
}

export const PRO_TRIAL_DAYS = 3

export const WHATSAPP_ENABLED_PLANS: PlanType[] = ['pro', 'annual']

export function isWhatsappEnabled(plan: PlanType) {
  return WHATSAPP_ENABLED_PLANS.includes(plan)
}
