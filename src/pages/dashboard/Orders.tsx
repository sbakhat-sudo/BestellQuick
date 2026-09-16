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
  const date = searchParams.get('date') ?? ''

  const filtered = useMemo(() => {
    if (!orders) return []
    let list = filter === 'all' ? orders : orders.filter((o) => o.status === filter)
    const query = search.trim().toLowerCase()
    if (query) {
      list = list.filter(
        (o) => o.customer_name.toLowerCase().includes(query) || o.customer_phone.toLowerCase().includes(query),
      )
    }
    if (date) {
      list = list.filter((o) => o.created_at.slice(0, 10) === date)
    }
    return list
  }, [orders, filter, search, date])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-neutral-900">{t('orders.title')}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => {
            const next = new URLSearchParams(searchParams)
            if (e.target.value) next.set('q', e.target.value)
            else next.delete('q')
            setSearchParams(next)
          }}
          placeholder={t('dashboard.overview.searchPlaceholder')}
          className="max-w-sm"
        />
        {date && (
          <span className="flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700">
            {new Date(date).toLocaleDateString()}
            <button
              type="button"
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.delete('date')
                setSearchParams(next)
              }}
              className="text-neutral-500 hover:text-neutral-900"
              aria-label={t('common.cancel')}
            >
              ×
            </button>
          </span>
        )}
      </div>

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
