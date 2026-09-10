import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { uploadRestaurantAsset } from '@/lib/storage'
import type { MenuItem, MenuItemStatus } from '@/types/database.types'
import type { MenuItemInput } from '@/hooks/useMenuItems'

interface MenuItemFormModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (input: MenuItemInput) => Promise<void>
  initial?: MenuItem
}

export function MenuItemFormModal({ open, onClose, onSubmit, initial }: MenuItemFormModalProps) {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price?.toString() ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [status, setStatus] = useState<MenuItemStatus>(initial?.status ?? 'available')
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photo_url ?? null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        name,
        description: description || null,
        price: Number(price),
        category: category || 'Divers',
        status,
        photo_url: photoUrl,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? t('menu.editItem') : t('menu.addItem')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ImageUpload
          label={t('common.photo')}
          value={photoUrl}
          onUpload={async (file) => setPhotoUrl(await uploadRestaurantAsset(restaurant.id, 'menu', file))}
        />
        <Input label={t('menu.name')} required value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea
          label={t('menu.description')}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('menu.price')}
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Input
            label={t('menu.category')}
            placeholder={t('menu.categoryPlaceholder')}
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <Select label={t('menu.status')} value={status} onChange={(e) => setStatus(e.target.value as MenuItemStatus)}>
          <option value="available">{t('menu.available')}</option>
          <option value="out_of_stock">{t('menu.outOfStock')}</option>
        </Select>
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
