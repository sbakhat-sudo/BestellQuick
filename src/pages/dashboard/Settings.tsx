import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { useUpdateRestaurant } from '@/hooks/useUpdateRestaurant'
import { uploadRestaurantAsset } from '@/lib/storage'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { RestaurantQrCode } from '@/components/dashboard/RestaurantQrCode'
import { DeliveryDriversSection } from '@/components/delivery/DeliveryDriversSection'
import { CommissionSettings } from '@/components/delivery/CommissionSettings'
import { BillingSection } from '@/components/settings/BillingSection'

export default function Settings() {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const updateRestaurant = useUpdateRestaurant()

  const [name, setName] = useState(restaurant.name)
  const [address, setAddress] = useState(restaurant.address ?? '')
  const [phone, setPhone] = useState(restaurant.phone ?? '')
  const [email, setEmail] = useState(restaurant.email ?? '')

  const onSaveInfo = async (e: FormEvent) => {
    e.preventDefault()
    await updateRestaurant.mutateAsync({ name, address, phone, email })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-neutral-900">{t('settings.title')}</h1>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-neutral-900">{t('settings.restaurantInfo')}</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSaveInfo} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageUpload
                label={t('settings.logo')}
                value={restaurant.logo_url}
                onUpload={async (file) => {
                  await updateRestaurant.mutateAsync({ logo_url: await uploadRestaurantAsset(restaurant.id, 'logo', file) })
                }}
              />
              <ImageUpload
                label={t('settings.coverPhoto')}
                value={restaurant.cover_photo_url}
                onUpload={async (file) => {
                  await updateRestaurant.mutateAsync({ cover_photo_url: await uploadRestaurantAsset(restaurant.id, 'cover', file) })
                }}
              />
            </div>
            <p className="-mt-2 text-xs text-neutral-400">{t('settings.logoHint')}</p>
            <Input label={t('settings.name')} required value={name} onChange={(e) => setName(e.target.value)} />
            <Input label={t('settings.address')} value={address} onChange={(e) => setAddress(e.target.value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label={t('settings.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label={t('settings.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Button type="submit" isLoading={updateRestaurant.isPending}>
                {t('common.save')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-900">{t('settings.openClosedTitle')}</h2>
        </CardHeader>
        <CardBody className="flex items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">{t('settings.openClosedDesc')}</p>
          <Toggle
            checked={restaurant.is_open}
            onChange={(checked) => updateRestaurant.mutate({ is_open: checked })}
            label={t('settings.openClosedTitle')}
            hideLabel
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-neutral-900">{t('settings.qrLinkTitle')}</h2>
        </CardHeader>
        <CardBody>
          <RestaurantQrCode slug={restaurant.slug} />
        </CardBody>
      </Card>

      <CommissionSettings />
      <DeliveryDriversSection />
      <BillingSection />
    </div>
  )
}
