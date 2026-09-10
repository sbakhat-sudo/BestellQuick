import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import type { OrderStatus, OrderType } from '@/types/database.types'

function stepsFor(orderType: OrderType): OrderStatus[] {
  return orderType === 'delivery'
    ? ['confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered']
    : ['confirmed', 'preparing', 'ready', 'delivered']
}

export function OrderStatusStepper({ status, orderType }: { status: OrderStatus; orderType: OrderType }) {
  const { t } = useTranslation()
  const steps = stepsFor(orderType)
  const currentIndex = steps.indexOf(status)

  return (
    <ol className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const done = i <= currentIndex
        const isLast = i === steps.length - 1
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={clsx(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  done ? 'bg-brand-600 text-white' : 'bg-neutral-200 text-neutral-500',
                )}
              >
                {i + 1}
              </span>
              {!isLast && <span className={clsx('w-0.5 flex-1', done ? 'bg-brand-600' : 'bg-neutral-200')} style={{ minHeight: 24 }} />}
            </div>
            <p className={clsx('pb-6 pt-1 text-sm font-medium', done ? 'text-neutral-900' : 'text-neutral-400')}>
              {t(`orderTracking.statusSteps.${step}`)}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
