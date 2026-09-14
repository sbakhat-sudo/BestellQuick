import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useOrders } from '@/hooks/useOrders'
import { Spinner } from '@/components/ui/Spinner'
import { Input } from '@/components/ui/Input'
import { OrderCard } from '@/components/orders/OrderCard'
import type { OrderStatus } from '@/types/database.types'
import clsx from 'clsx'

const STATUSES: OrderStatus[] = ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']

export default function Orders() {
  const { t } = useTranslation()
  const { data: orders, isLoading } = useOrders()
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('q') ?? ''

  const filtered = useMemo(() => {
    if (!orders) return []
    let list = filter === 'all' ? orders : orders.filter((o) => o.status === filter)
    const query = search.trim().toLowerCase()
    if (query) {
      list = list.filter(
        (o) => o.customer_name.toLowerCase().includes(query) || o.customer_phone.toLowerCase().includes(query),
      )
    }
    return list
  }, [orders, filter, search])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-neutral-900">{t('orders.title')}</h1>

      <Input
        value={search}
        onChange={(e) => setSearchParams(e.target.value ? { q: e.target.value } : {})}
        placeholder={t('dashboard.overview.searchPlaceholder')}
        className="max-w-sm"
      />

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
