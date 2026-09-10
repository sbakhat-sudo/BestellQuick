import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOrders } from '@/hooks/useOrders'
import { Spinner } from '@/components/ui/Spinner'
import { OrderCard } from '@/components/orders/OrderCard'
import type { OrderStatus } from '@/types/database.types'
import clsx from 'clsx'

const STATUSES: OrderStatus[] = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']

export default function Orders() {
  const { t } = useTranslation()
  const { data: orders, isLoading } = useOrders()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  const filtered = useMemo(() => {
    if (!orders) return []
    if (filter === 'all') return orders
    return orders.filter((o) => o.status === filter)
  }, [orders, filter])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-neutral-900">{t('orders.title')}</h1>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={clsx(
            'rounded-full px-3 py-1.5 text-sm font-medium',
            filter === 'all' ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-700',
          )}
        >
          {t('orders.filterAll')}
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={clsx(
              'rounded-full px-3 py-1.5 text-sm font-medium',
              filter === s ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-700',
            )}
          >
            {t(`orders.status.${s}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <p className="text-neutral-500">{t('orders.noOrders')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
