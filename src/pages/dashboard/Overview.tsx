import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { useOrders } from '@/hooks/useOrders'
import { useUpdateRestaurant } from '@/hooks/useUpdateRestaurant'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { RestaurantQrCode } from '@/components/dashboard/RestaurantQrCode'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { PLAN_LIMITS } from '@/lib/plans'

export default function Overview() {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const { data: orders = [] } = useOrders()
  const updateRestaurant = useUpdateRestaurant()

  const { ordersToday, revenueToday, recent } = useMemo(() => {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const todays = orders.filter((o) => new Date(o.created_at) >= startOfDay)
    return {
      ordersToday: todays.length,
      revenueToday: todays.reduce((sum, o) => sum + Number(o.total_price), 0),
      recent: orders.slice(0, 5),
    }
  }, [orders])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.overview.title')}</h1>
        <p className="text-neutral-600">{t('dashboard.overview.welcome', { name: restaurant.name })}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-neutral-500">{t('dashboard.overview.ordersToday')}</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900">{ordersToday}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-neutral-500">{t('dashboard.overview.revenueToday')}</p>
            <p className="mt-1 text-3xl font-bold text-neutral-900">
              {revenueToday.toFixed(2)} {t('common.currency')}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">{t('dashboard.overview.openStatus')}</p>
              <p className="mt-1 text-lg font-semibold text-neutral-900">
                {restaurant.is_open ? t('dashboard.overview.open') : t('dashboard.overview.closed')}
              </p>
            </div>
            <Toggle
              checked={restaurant.is_open}
              onChange={(checked) => updateRestaurant.mutate({ is_open: checked })}
              label={t('dashboard.overview.openStatus')}
              hideLabel
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">{t('dashboard.overview.qrTitle')}</h2>
          </CardHeader>
          <CardBody>
            <p className="mb-3 text-sm text-neutral-500">{t('dashboard.overview.qrDesc')}</p>
            <RestaurantQrCode slug={restaurant.slug} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-neutral-900">{t('dashboard.overview.planTitle')}</h2>
          </CardHeader>
          <CardBody className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge tone="brand">{t(`settings.plan${restaurant.plan[0].toUpperCase()}${restaurant.plan.slice(1)}`)}</Badge>
              <span className="text-sm text-neutral-500">{PLAN_LIMITS[restaurant.plan].priceLabel}</span>
            </div>
            <Link to="/dashboard/settings" className="text-sm font-semibold text-brand-700 hover:underline">
              {t('settings.upgrade')} →
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-neutral-900">{t('dashboard.overview.recentOrders')}</h2>
        </CardHeader>
        <CardBody>
          {recent.length === 0 ? (
            <p className="text-sm text-neutral-500">{t('dashboard.overview.noOrdersYet')}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-neutral-100">
              {recent.map((order) => (
                <li key={order.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-neutral-900">{order.customer_name}</p>
                    <p className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {Number(order.total_price).toFixed(2)} {t('common.currency')}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
