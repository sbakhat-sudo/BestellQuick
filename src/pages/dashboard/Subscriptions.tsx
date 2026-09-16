import { useTranslation } from 'react-i18next'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { useBillingPortal, useCreateCheckoutSession, useSubscription } from '@/hooks/useBilling'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PLAN_LIMITS, PRO_TRIAL_DAYS } from '@/lib/plans'
import type { PlanType } from '@/types/database.types'

const PLAN_KEY: Record<PlanType, string> = { free: 'planFree', pro: 'planPro', annual: 'planAnnual' }
const PLAN_GRADIENT: Record<PlanType, string> = {
  free: 'from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-900/60',
  pro: 'from-brand-50 via-white to-brand-100 dark:from-brand-900/30 dark:via-neutral-900 dark:to-brand-900/10',
  annual: 'from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/20',
}

export default function Subscriptions() {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const { data: subscription } = useSubscription()
  const checkout = useCreateCheckoutSession()
  const portal = useBillingPortal()

  const goToCheckout = async (plan: 'pro' | 'annual') => {
    const url = await checkout.mutateAsync(plan)
    window.location.assign(url)
  }

  const goToPortal = async () => {
    const url = await portal.mutateAsync()
    window.location.assign(url)
  }

  const plans: PlanType[] = ['free', 'pro', 'annual']

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{t('subscriptions.title')}</h1>
        <p className="text-neutral-600 dark:text-neutral-400">{t('subscriptions.subtitle')}</p>
      </div>

      <Card className="animate-fade-in-up">
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">{t('settings.currentPlan')}</span>
            <Badge tone="brand">{t(`settings.${PLAN_KEY[restaurant.plan]}`)}</Badge>
            {subscription?.status === 'trialing' && <Badge tone="warning">{t('settings.trialInfo')}</Badge>}
          </div>
          {subscription?.stripe_customer_id && (
            <Button variant="ghost" size="sm" isLoading={portal.isPending} onClick={goToPortal}>
              {t('settings.manageBilling')}
            </Button>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan, i) => {
          const isCurrent = restaurant.plan === plan
          const limit = PLAN_LIMITS[plan].monthlyOrders
          return (
            <Card
              key={plan}
              className={`animate-fade-in-up relative ${PLAN_GRADIENT[plan]} ${isCurrent ? 'border-brand-500 ring-2 ring-brand-500/30' : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {t('subscriptions.currentPlanBadge')}
                </span>
              )}
              <CardBody className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{t(`settings.${PLAN_KEY[plan]}`)}</p>
                <p className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-2xl font-bold text-transparent dark:from-brand-400 dark:to-brand-300">
                  {PLAN_LIMITS[plan].priceLabel}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {limit ? t('subscriptions.orderLimit', { count: limit }) : t('dashboard.overview.unlimitedOrders')}
                </p>
                {plan !== 'free' && (
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {t('settings.trialInfo')}: {PRO_TRIAL_DAYS}j
                  </p>
                )}

                {plan !== 'free' && !isCurrent && (
                  <Button className="mt-2 w-full" variant={plan === 'pro' ? 'primary' : 'outline'} isLoading={checkout.isPending} onClick={() => goToCheckout(plan as 'pro' | 'annual')}>
                    {t('subscriptions.chooseThisPlan')}
                  </Button>
                )}
                {isCurrent && (
                  <span className="mt-2 text-sm font-medium text-brand-600 dark:text-brand-400">✓ {t('subscriptions.active')}</span>
                )}
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
