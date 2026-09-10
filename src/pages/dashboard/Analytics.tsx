import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useOrders } from '@/hooks/useOrders'
import { buildDailySeries, useAnalyticsEvents } from '@/hooks/useAnalytics'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import clsx from 'clsx'

export default function Analytics() {
  const { t } = useTranslation()
  const [range, setRange] = useState<7 | 30>(7)
  const { data: events, isLoading: loadingEvents } = useAnalyticsEvents(range)
  const { data: orders, isLoading: loadingOrders } = useOrders()

  const series = useMemo(() => buildDailySeries(events ?? [], range), [events, range])

  const { totalOrders, totalRevenue, recurring, newCustomers, customerRows } = useMemo(() => {
    const list = orders ?? []
    const byPhone = new Map<string, { name: string; phone: string; count: number }>()
    for (const order of list) {
      const entry = byPhone.get(order.customer_phone) ?? { name: order.customer_name, phone: order.customer_phone, count: 0 }
      entry.count += 1
      byPhone.set(order.customer_phone, entry)
    }
    const rows = Array.from(byPhone.values()).sort((a, b) => b.count - a.count)
    return {
      totalOrders: list.length,
      totalRevenue: list.reduce((sum, o) => sum + Number(o.total_price), 0),
      recurring: rows.filter((r) => r.count > 1).length,
      newCustomers: rows.filter((r) => r.count === 1).length,
      customerRows: rows,
    }
  }, [orders])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-neutral-900">{t('analytics.title')}</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label={t('analytics.totalOrders')} value={totalOrders} />
        <StatCard label={t('analytics.totalRevenue')} value={`${totalRevenue.toFixed(2)} ${t('common.currency')}`} />
        <StatCard label={t('analytics.recurringCustomers')} value={recurring} />
        <StatCard label={t('analytics.newCustomers')} value={newCustomers} />
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">
            {t('analytics.qrScans')} / {t('analytics.linkClicks')}
          </h2>
          <div className="flex gap-1">
            {[7, 30].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setRange(d as 7 | 30)}
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  range === d ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-700',
                )}
              >
                {d === 7 ? t('analytics.last7days') : t('analytics.last30days')}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          {loadingEvents ? (
            <Spinner />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="qr_scan" name={t('analytics.qrScans')} stroke="#16a34a" strokeWidth={2} />
                  <Line type="monotone" dataKey="link_click" name={t('analytics.linkClicks')} stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-neutral-900">{t('analytics.orderHistory')}</h2>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          {loadingOrders ? (
            <Spinner />
          ) : (
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-neutral-500">
                  <th className="py-2 pe-3 font-medium">{t('analytics.customer')}</th>
                  <th className="py-2 pe-3 font-medium">{t('orders.phone')}</th>
                  <th className="py-2 pe-3 font-medium">{t('common.date')}</th>
                  <th className="py-2 pe-3 font-medium">{t('common.status')}</th>
                  <th className="py-2 font-medium">{t('orders.total')}</th>
                </tr>
              </thead>
              <tbody>
                {(orders ?? []).map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100">
                    <td className="py-2 pe-3">{order.customer_name}</td>
                    <td className="py-2 pe-3">{order.customer_phone}</td>
                    <td className="py-2 pe-3 text-neutral-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-2 pe-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="py-2">
                      {Number(order.total_price).toFixed(2)} {t('common.currency')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-neutral-900">{t('analytics.customer')}</h2>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[350px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="py-2 pe-3 font-medium">{t('analytics.customer')}</th>
                <th className="py-2 font-medium">{t('analytics.orders')}</th>
              </tr>
            </thead>
            <tbody>
              {customerRows.map((row) => (
                <tr key={row.phone} className="border-b border-neutral-100">
                  <td className="py-2 pe-3">
                    {row.name} <span className="text-neutral-400">· {row.phone}</span>
                  </td>
                  <td className="py-2">{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs text-neutral-500">{label}</p>
        <p className="mt-1 text-xl font-bold text-neutral-900">{value}</p>
      </CardBody>
    </Card>
  )
}
