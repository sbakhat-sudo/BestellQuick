import { useTranslation } from 'react-i18next'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { useBillingPortal, useCreateCheckoutSession, useSubscription } from '@/hooks/useBilling'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PLAN_LIMITS, PRO_TRIAL_DAYS } from '@/lib/plans'
import type { PlanType } from '@/types/database.types'

const PLAN_KEY: Record<PlanType, string> = { free: 'planFree', pro: 'planPro', annual: 'planAnnual' }

export function BillingSection() {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const { data: subscription } = useSubscription()
  const checkout = useCreateCheckoutSession()
  const portal = useBillingPortal()

  const goToCheckout = async (plan: 'pro' | 'annual') => {
    const url = await checkout.mutateAsync(plan)
    window.location.href = url
  }

  const goToPortal = async () => {
    const url = await portal.mutateAsync()
    window.location.href = url
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-neutral-900">{t('settings.planTitle')}</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">{t('settings.currentPlan')}</span>
          <Badge tone="brand">{t(`settings.${PLAN_KEY[restaurant.plan]}`)}</Badge>
          {subscription?.status === 'trialing' && <Badge tone="warning">{t('settings.trialInfo')}</Badge>}
        </div>

        {restaurant.plan === 'free' && (
          <p className="text-sm text-neutral-500">{t('settings.planLimitReached')}</p>
        )}

        <div className="flex flex-wrap gap-3">
          {restaurant.plan !== 'pro' && (
            <Button variant="outline" isLoading={checkout.isPending} onClick={() => goToCheckout('pro')}>
              {t('settings.planPro')} — {PLAN_LIMITS.pro.priceLabel} ({t('settings.trialInfo')}: {PRO_TRIAL_DAYS}j)
            </Button>
          )}
          {restaurant.plan !== 'annual' && (
            <Button variant="outline" isLoading={checkout.isPending} onClick={() => goToCheckout('annual')}>
              {t('settings.planAnnual')} — {PLAN_LIMITS.annual.priceLabel}
            </Button>
          )}
          {subscription?.stripe_customer_id && (
            <Button variant="ghost" isLoading={portal.isPending} onClick={goToPortal}>
              {t('settings.manageBilling')}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
