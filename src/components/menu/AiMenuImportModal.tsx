import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getErrorMessage } from '@/lib/errors'
import { useParseMenuImage } from '@/hooks/useParseMenuImage'
import { useCreateMenuItem } from '@/hooks/useMenuItems'

interface AiMenuImportModalProps {
  open: boolean
  onClose: () => void
}

interface ReviewItem {
  selected: boolean
  name: string
  description: string
  price: string
  category: string
}

export function AiMenuImportModal({ open, onClose }: AiMenuImportModalProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const parseMenuImage = useParseMenuImage()
  const createItem = useCreateMenuItem()

  const [photos, setPhotos] = useState<File[]>([])
  const [reviewItems, setReviewItems] = useState<ReviewItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const reset = () => {
    setPhotos([])
    setReviewItems(null)
    setError(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  const onPickPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length > 0) setPhotos((prev) => [...prev, ...files].slice(0, 6))
    if (inputRef.current) inputRef.current.value = ''
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const analyze = async () => {
    setError(null)
    try {
      const items = await parseMenuImage.mutateAsync(photos)
      setReviewItems(
        items.map((item) => ({
          selected: true,
          name: item.name,
          description: item.description ?? '',
          price: item.price?.toString() ?? '',
          category: item.category,
        })),
      )
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AI menu parsing failed:', err)
      setError(getErrorMessage(err, t('common.error')))
    }
  }

  const patchItem = (index: number, patch: Partial<ReviewItem>) => {
    setReviewItems((prev) => (prev ? prev.map((item, i) => (i === index ? { ...item, ...patch } : item)) : prev))
  }

  const importSelected = async () => {
    if (!reviewItems) return
    setImporting(true)
    setError(null)
    try {
      const toImport = reviewItems.filter((item) => item.selected && item.name && item.price)
      for (const item of toImport) {
        await createItem.mutateAsync({
          name: item.name,
          description: item.description || null,
          price: Number(item.price),
          category: item.category || 'Divers',
          status: 'available',
          photo_url: null,
        })
      }
      close()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('AI menu import failed:', err)
      setError(getErrorMessage(err, t('common.error')))
    } finally {
      setImporting(false)
    }
  }

  const selectedCount = reviewItems?.filter((item) => item.selected).length ?? 0

  return (
    <Modal open={open} onClose={close} title={t('menu.ai.title')}>
      <div className="flex flex-col gap-4">
        {!reviewItems && (
          <>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('menu.ai.description')}</p>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {photos.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg">
                    <img src={URL.createObjectURL(file)} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      aria-label={t('common.delete')}
                      className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
              {t('menu.ai.addPhotos')}
            </Button>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickPhotos} />

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={close}>
                {t('common.cancel')}
              </Button>
              <Button type="button" isLoading={parseMenuImage.isPending} disabled={photos.length === 0} onClick={analyze}>
                {t('menu.ai.analyze')}
              </Button>
            </div>
          </>
        )}

        {reviewItems && (
          <>
            {reviewItems.length === 0 ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('menu.ai.noItemsFound')}</p>
            ) : (
              <>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('menu.ai.reviewHint')}</p>
                <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto pr-1">
                  {reviewItems.map((item, i) => (
                    <div
                      key={i}
                      className="animate-fade-in-up flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800"
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={(e) => patchItem(i, { selected: e.target.checked })}
                          className="size-4 rounded border-neutral-300 text-brand-600 dark:border-neutral-700"
                        />
                        {t('menu.ai.itemN', { n: i + 1 })}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={item.name}
                          onChange={(e) => patchItem(i, { name: e.target.value })}
                          placeholder={t('menu.name')}
                        />
                        <Input
                          value={item.category}
                          onChange={(e) => patchItem(i, { category: e.target.value })}
                          placeholder={t('menu.category')}
                        />
                      </div>
                      <Input
                        value={item.description}
                        onChange={(e) => patchItem(i, { description: e.target.value })}
                        placeholder={t('menu.description')}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) => patchItem(i, { price: e.target.value })}
                        placeholder={t('menu.price')}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setReviewItems(null)}>
                {t('common.back')}
              </Button>
              {reviewItems.length > 0 && (
                <Button type="button" isLoading={importing} disabled={selectedCount === 0} onClick={importSelected}>
                  {t('menu.ai.importSelected', { count: selectedCount })}
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
