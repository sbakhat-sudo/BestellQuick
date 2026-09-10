import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { uploadRestaurantAsset } from '@/lib/storage'
import type { Offer } from '@/types/database.types'
import type { OfferInput } from '@/hooks/useOffers'

interface OfferFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: OfferInput) => Promise<void>
  initial?: Offer
}

const today = () => new Date().toISOString().slice(0, 10)

export function OfferFormModal({ open, onClose, onSubmit, initial }: OfferFormModalProps) {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [startDate, setStartDate] = useState(initial?.start_date ?? today())
  const [endDate, setEndDate] = useState(initial?.end_date ?? '')
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photo_url ?? null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        title,
        description: description || null,
        price: price ? Number(price) : null,
        start_date: startDate,
        end_date: endDate || null,
        photo_url: photoUrl,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? t('offers.editOffer') : t('offers.addOffer')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ImageUpload
          label={t('common.photo')}
          value={photoUrl}
          onUpload={async (file) => setPhotoUrl(await uploadRestaurantAsset(restaurant.id, 'offers', file))}
        />
        <Input label={t('offers.offerTitle')} required value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label={t('offers.description')} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label={t('offers.price')} type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('offers.startDate')} type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label={t('offers.endDate')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
