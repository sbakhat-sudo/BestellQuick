import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { OrderStatusBadge } from './OrderStatusBadge'
import { nextOrderStatus, useUpdateOrderStatus, type OrderWithItems } from '@/hooks/useOrders'
import { useAssignDelivery, useDeliveryDrivers } from '@/hooks/useDeliveryDrivers'

export function OrderCard({ order }: { order: OrderWithItems }) {
  const { t } = useTranslation()
  const updateStatus = useUpdateOrderStatus()
  const { data: drivers } = useDeliveryDrivers()
  const assignDelivery = useAssignDelivery()
  const [distanceKm, setDistanceKm] = useState('')

  const next = nextOrderStatus(order.status, order.order_type)
  const delivery = order.deliveries?.[0]

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-neutral-900">{order.customer_name}</p>
            <p className="text-xs text-neutral-500">{order.customer_phone}</p>
            <p className="text-xs text-neutral-400">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <OrderStatusBadge status={order.status} />
            <Badge tone="neutral">{order.order_type === 'dine_in' ? t('orders.dineIn') : t('orders.delivery')}</Badge>
          </div>
        </div>

        <ul className="flex flex-col gap-0.5 border-y border-neutral-100 py-2 text-sm text-neutral-700">
          {order.order_items.map((line, i) => (
            <li key={i} className="flex justify-between">
              <span>
                {line.quantity}× {line.menu_items?.name ?? '—'}
              </span>
              <span>{(line.unit_price * line.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">{t('orders.total')}</span>
          <span className="font-semibold">
            {Number(order.total_price).toFixed(2)} {t('common.currency')}
          </span>
        </div>

        {order.order_type === 'delivery' && (
          <div className="flex flex-col gap-2 rounded-lg bg-neutral-50 p-3">
            <p className="text-xs font-semibold uppercase text-neutral-500">{t('orders.assignDriver')}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={delivery?.driver_id ?? ''}
                onChange={(e) => {
                  const driverId = e.target.value
                  if (!driverId) return
                  assignDelivery.mutate({ orderId: order.id, driverId, distanceKm: distanceKm ? Number(distanceKm) : undefined })
                }}
                className="max-w-xs"
              >
                <option value="">—</option>
                {drivers?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder={t('delivery.distanceKm')}
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="w-28 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm"
              />
              {delivery && (
                <span className="text-xs text-neutral-500">
                  {t('orders.commission')}: {Number(delivery.commission_amount).toFixed(2)} {t('common.currency')}
                </span>
              )}
            </div>
          </div>
        )}

        {next && (
          <Button size="sm" onClick={() => updateStatus.mutate({ orderId: order.id, status: next })} isLoading={updateStatus.isPending}>
            {t(`orders.status.${next}`)} →
          </Button>
        )}
      </CardBody>
    </Card>
  )
}
