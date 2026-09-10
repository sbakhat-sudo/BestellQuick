import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCart } from '@/context/CartContext'
import { usePlaceOrder, PlaceOrderError } from '@/hooks/usePlaceOrder'
import type { AccessSource, OrderType } from '@/types/database.types'

interface CartModalProps {
  open: boolean
  onClose: () => void
  restaurantId: string
  accessSource: AccessSource
  onOrderPlaced: (orderId: string) => void
}

export function CartModal({ open, onClose, restaurantId, accessSource, onOrderPlaced }: CartModalProps) {
  const { t } = useTranslation()
  const { lines, setQuantity, total, clear } = useCart()
  const placeOrder = usePlaceOrder()
  const [orderType, setOrderType] = useState<OrderType>('dine_in')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const order = await placeOrder.mutateAsync({
        restaurantId,
        customerName: name,
        customerPhone: phone,
        orderType,
        accessSource,
        items: lines.map((l) => ({ menu_item_id: l.item.id, quantity: l.quantity })),
      })
      clear()
      onOrderPlaced(order.id)
    } catch (err) {
      if (err instanceof PlaceOrderError && err.code === 'PLAN_LIMIT_REACHED') {
        setError(t('publicMenu.planLimitError'))
      } else {
        setError(t('publicMenu.orderError'))
      }
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('publicMenu.yourCart')}>
      {lines.length === 0 ? (
        <p className="text-sm text-neutral-500">{t('publicMenu.emptyCart')}</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-neutral-100">
            {lines.map((line) => (
              <li key={line.item.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900">{line.item.name}</p>
                  <p className="text-xs text-neutral-500">
                    {Number(line.item.price).toFixed(2)} {t('common.currency')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="-"
                    onClick={() => setQuantity(line.item.id, line.quantity - 1)}
                    className="size-7 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm">{line.quantity}</span>
                  <button
                    type="button"
                    aria-label="+"
                    onClick={() => setQuantity(line.item.id, line.quantity + 1)}
                    className="size-7 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-neutral-200 pt-3 font-semibold">
            <span>{t('publicMenu.orderTotal')}</span>
            <span>
              {total.toFixed(2)} {t('common.currency')}
            </span>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-neutral-800">{t('publicMenu.orderType')}</legend>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                aria-pressed={orderType === 'dine_in'}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  orderType === 'dine_in' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-neutral-300 text-neutral-700'
                }`}
              >
                {t('publicMenu.dineIn')}
              </button>
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                aria-pressed={orderType === 'delivery'}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                  orderType === 'delivery' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-neutral-300 text-neutral-700'
                }`}
              >
                {t('publicMenu.delivery')}
              </button>
            </div>
          </fieldset>

          <Input label={t('publicMenu.yourName')} required value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label={t('publicMenu.yourPhone')}
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <Button type="submit" isLoading={placeOrder.isPending} className="w-full">
            {placeOrder.isPending ? t('publicMenu.placingOrder') : t('publicMenu.placeOrder')}
          </Button>
        </form>
      )}
    </Modal>
  )
}
