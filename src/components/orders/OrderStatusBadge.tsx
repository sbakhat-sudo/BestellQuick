import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import type { OrderStatus } from '@/types/database.types'

const TONE: Record<OrderStatus, 'neutral' | 'brand' | 'success' | 'warning'> = {
  confirmed: 'neutral',
  preparing: 'warning',
  ready: 'brand',
  out_for_delivery: 'brand',
  delivered: 'success',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useTranslation()
  return <Badge tone={TONE[status]}>{t(`orders.status.${status}`)}</Badge>
}
