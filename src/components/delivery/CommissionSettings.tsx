import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { useUpdateRestaurant } from '@/hooks/useUpdateRestaurant'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { CommissionType } from '@/types/database.types'

export function CommissionSettings() {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const updateRestaurant = useUpdateRestaurant()
  const [type, setType] = useState<CommissionType>(restaurant.delivery_commission_type)
  const [value, setValue] = useState(restaurant.delivery_commission_value.toString())

  const onSave = () => {
    updateRestaurant.mutate({ delivery_commission_type: type, delivery_commission_value: Number(value) })
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-neutral-900">{t('settings.deliveryCommissionTitle')}</h2>
      </CardHeader>
      <CardBody className="flex flex-wrap items-end gap-3">
        <Select label={t('delivery.commissionType')} value={type} onChange={(e) => setType(e.target.value as CommissionType)} className="w-56">
          <option value="fixed">{t('delivery.commissionFixed')}</option>
          <option value="percentage">{t('delivery.commissionPercentage')}</option>
          <option value="distance">{t('delivery.commissionDistance')}</option>
        </Select>
        <Input
          label={t('delivery.commissionValue')}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32"
        />
        <Button onClick={onSave} isLoading={updateRestaurant.isPending}>
          {t('common.save')}
        </Button>
      </CardBody>
    </Card>
  )
}
