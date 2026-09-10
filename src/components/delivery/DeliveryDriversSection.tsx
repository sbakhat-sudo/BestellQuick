import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useCreateDeliveryDriver,
  useDeleteDeliveryDriver,
  useDeliveryDrivers,
  useUpdateDeliveryDriver,
} from '@/hooks/useDeliveryDrivers'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Spinner } from '@/components/ui/Spinner'

export function DeliveryDriversSection() {
  const { t } = useTranslation()
  const { data: drivers, isLoading } = useDeliveryDrivers()
  const createDriver = useCreateDeliveryDriver()
  const updateDriver = useUpdateDeliveryDriver()
  const deleteDriver = useDeleteDeliveryDriver()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const onAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return
    await createDriver.mutateAsync({ name, phone })
    setName('')
    setPhone('')
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-neutral-900">{t('delivery.title')}</h2>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <form onSubmit={onAdd} className="flex flex-wrap items-end gap-2">
          <Input label={t('delivery.name')} value={name} onChange={(e) => setName(e.target.value)} className="w-40" />
          <Input label={t('delivery.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-40" />
          <Button type="submit" size="sm" isLoading={createDriver.isPending}>
            {t('delivery.addDriver')}
          </Button>
        </form>

        {isLoading ? (
          <Spinner />
        ) : !drivers || drivers.length === 0 ? (
          <p className="text-sm text-neutral-500">{t('delivery.noDrivers')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-100">
            {drivers.map((driver) => (
              <li key={driver.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{driver.name}</p>
                  <p className="text-xs text-neutral-500">{driver.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={driver.is_active}
                    onChange={(checked) => updateDriver.mutate({ id: driver.id, patch: { is_active: checked } })}
                    label={driver.is_active ? t('delivery.active') : t('delivery.inactive')}
                    hideLabel
                  />
                  <button
                    type="button"
                    onClick={() => deleteDriver.mutate(driver.id)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  )
}
