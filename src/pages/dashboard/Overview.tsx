import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { useOrders } from '@/hooks/useOrders'
import { useUpdateRestaurant } from '@/hooks/useUpdateRestaurant'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { RingStat } from '@/components/ui/RingStat'
import { MiniCalendar } from '@/components/dashboard/MiniCalendar'
import { RestaurantQrCode } from '@/components/dashboard/RestaurantQrCode'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { PLAN_LIMITS } from '@/lib/plans'

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5 text-amber-600" aria-hidden="true">
      <path d="M6 8h12l-1 12H7L6 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5 text-teal-600" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v8M9.5 9.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.6c0 2-5 1-5 3.1 0 1 1 1.5 2.5 1.5s2.5-.5 2.5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5 text-sky-600" aria-hidden="true">
      <path d="M4 9l1-4h14l1 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function percentVsYesterday(today: number, yesterday: number): number {
  if (today <= 0) return 0
  if (yesterday <= 0) return 100
  return Math.min(100, Math.round((today / yesterday) * 100))
}

export default function Overview() {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const { data: orders = [] } = useOrders()
  const updateRestaurant = useUpdateRestaurant()

  const { ordersToday, revenueToday, ordersTodayPct, revenueTodayPct, ordersThisMonth, recent } = useMemo(() => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfYesterday.getDate() - 1)
    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1)

    const todays = orders.filter((o) => new Date(o.created_at) >= startOfToday)
    const yesterdays = orders.filter((o) => {
      const d = new Date(o.created_at)
      return d >= startOfYesterday && d < startOfToday
    })
    const monthly = orders.filter((o) => new Date(o.created_at) >= startOfMonth)

    const todaysRevenue = todays.reduce((sum, o) => sum + Number(o.total_price), 0)
    const yesterdaysRevenue = yesterdays.reduce((sum, o) => sum + Number(o.total_price), 0)

    return {
      ordersToday: todays.length,
      revenueToday: todaysRevenue,
      ordersTodayPct: percentVsYesterday(todays.length, yesterdays.length),
      revenueTodayPct: percentVsYesterday(todaysRevenue, yesterdaysRevenue),
      ordersThisMonth: monthly.length,
      recent: orders.slice(0, 5),
    }
  }, [orders])

  const monthlyLimit = PLAN_LIMITS[restaurant.plan].monthlyOrders
  const planLabel = t(`settings.plan${restaurant.plan[0].toUpperCase()}${restaurant.plan.slice(1)}`)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{t('dashboard.overview.title')}</h1>
        <p className="text-neutral-600">{t('dashboard.overview.welcome', { name: restaurant.name })}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="flex items-center gap-4">
            <RingStat percent={ordersTodayPct} icon={<BagIcon />} colorFrom="#fde047" colorTo="#22c55e" />
            <div>
              <p className="text-sm text-neutral-500">{t('dashboard.overview.ordersToday')}</p>
              <p className="text-3xl font-bold text-neutral-900">{ordersToday}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <RingStat percent={revenueTodayPct} icon={<CoinIcon />} colorFrom="#5eead4" colorTo="#0ea5e9" />
            <div>
              <p className="text-sm text-neutral-500">{t('dashboard.overview.revenueToday')}</p>
              <p className="text-3xl font-bold text-neutral-900">
                {revenueToday.toFixed(2)} {t('common.currency')}
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <RingStat percent={restaurant.is_open ? 100 : 0} icon={<ShopIcon />} colorFrom="#7dd3fc" colorTo="#6366f1" />
            <div className="flex-1">
              <p className="text-sm text-neutral-500">{t('dashboard.overview.openStatus')}</p>
              <p className="text-lg font-semibold text-neutral-900">
                {restaurant.is_open ? t('dashboard.overview.open') : t('dashboard.overview.closed')}
              </p>
              <div className="mt-1">
                <Toggle
                  checked={restaurant.is_open}
                  onChange={(checked) => updateRestaurant.mutate({ is_open: checked })}
                  label={t('dashboard.overview.openStatus')}
                  hideLabel
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-neutral-900">{t('dashboard.overview.calendarTitle')}</h2>
          </CardHeader>
          <CardBody>
            <MiniCalendar />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
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
              <Badge tone="brand">{planLabel}</Badge>
              <span className="text-sm text-neutral-500">{PLAN_LIMITS[restaurant.plan].priceLabel}</span>
            </div>
            {monthlyLimit ? (
              <div>
                <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${Math.min(100, (ordersThisMonth / monthlyLimit) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {ordersThisMonth}/{monthlyLimit} {t('dashboard.overview.ordersUsedThisMonth')}
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-500">{t('dashboard.overview.unlimitedOrders')}</p>
            )}
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
