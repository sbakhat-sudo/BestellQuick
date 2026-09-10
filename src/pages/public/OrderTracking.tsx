import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { useOrderTracking, useDeliveryTracking } from '@/hooks/useOrderTracking'
import { usePublicRestaurant } from '@/hooks/usePublicRestaurant'
import { Spinner } from '@/components/ui/Spinner'
import { Card, CardBody } from '@/components/ui/Card'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { OrderStatusStepper } from '@/components/public/OrderStatusStepper'

export default function OrderTracking() {
  const { t } = useTranslation()
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>()
  const { data: restaurant } = usePublicRestaurant(slug)
  const { data: order, isLoading } = useOrderTracking(orderId)
  const { data: delivery } = useDeliveryTracking(orderId, order?.order_type === 'delivery')

  if (isLoading || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {restaurant && <PublicHeader restaurant={restaurant} />}

      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="text-xl font-bold text-neutral-900">{t('orderTracking.thankYou')}</h1>
        <p className="mb-1 text-sm text-neutral-500">{t('orderTracking.orderNumber', { id: order.id.slice(0, 8).toUpperCase() })}</p>
        <p className="mb-6 text-xs text-neutral-400">{t('orderTracking.liveUpdates')}</p>

        <Card>
          <CardBody>
            <OrderStatusStepper status={order.status} orderType={order.order_type} />

            <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-sm">
              <span className="text-neutral-500">{t('orders.total')}</span>
              <span className="font-semibold">
                {Number(order.total_price).toFixed(2)} {t('common.currency')}
              </span>
            </div>

            {delivery?.driver_name && (
              <div className="mt-4 rounded-lg bg-neutral-50 p-3">
                <p className="text-xs font-semibold uppercase text-neutral-500">{t('orderTracking.driverInfo')}</p>
                <p className="text-sm font-medium text-neutral-900">{delivery.driver_name}</p>
                {delivery.driver_phone && <p className="text-xs text-neutral-500">{delivery.driver_phone}</p>}
              </div>
            )}
          </CardBody>
        </Card>

        {slug && (
          <Link to={`/r/${slug}`} className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline">
            ← {t('orderTracking.backToMenu')}
          </Link>
        )}
      </main>
    </div>
  )
}
