import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateOffer, useDeleteOffer, useOffers, useUpdateOffer } from '@/hooks/useOffers'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { OfferFormModal } from '@/components/offers/OfferFormModal'
import type { Offer } from '@/types/database.types'

function offerTone(offer: Offer): { tone: 'success' | 'neutral' | 'warning'; key: 'activeNow' | 'upcoming' | 'expired' } {
  const today = new Date().toISOString().slice(0, 10)
  if (offer.start_date > today) return { tone: 'warning', key: 'upcoming' }
  if (offer.end_date && offer.end_date < today) return { tone: 'neutral', key: 'expired' }
  return { tone: 'success', key: 'activeNow' }
}

export default function Offers() {
  const { t } = useTranslation()
  const { data: offers, isLoading } = useOffers()
  const createOffer = useCreateOffer()
  const updateOffer = useUpdateOffer()
  const deleteOffer = useDeleteOffer()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Offer | undefined>(undefined)

  const onDelete = async (id: string) => {
    if (window.confirm(t('offers.confirmDelete'))) {
      await deleteOffer.mutateAsync(id)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{t('offers.title')}</h1>
        <Button
          onClick={() => {
            setEditing(undefined)
            setModalOpen(true)
          }}
        >
          {t('offers.addOffer')}
        </Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !offers || offers.length === 0 ? (
        <p className="text-neutral-500">{t('offers.noOffers')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => {
            const { tone, key } = offerTone(offer)
            return (
              <Card key={offer.id} className="overflow-hidden">
                {offer.photo_url && <img src={offer.photo_url} alt="" className="h-32 w-full object-cover" />}
                <CardBody>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="font-semibold text-neutral-900">{offer.title}</p>
                    <Badge tone={tone}>{t(`offers.${key}`)}</Badge>
                  </div>
                  {offer.description && <p className="mb-2 line-clamp-2 text-xs text-neutral-500">{offer.description}</p>}
                  <p className="text-xs text-neutral-400">
                    {offer.start_date} {offer.end_date ? `→ ${offer.end_date}` : ''}
                  </p>
                  {offer.price != null && (
                    <p className="mt-1 font-semibold text-brand-700">
                      {Number(offer.price).toFixed(2)} {t('common.currency')}
                    </p>
                  )}
                  <div className="mt-3 flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(offer)
                        setModalOpen(true)
                      }}
                      className="text-xs font-semibold text-neutral-700 hover:underline"
                    >
                      {t('common.edit')}
                    </button>
                    <button type="button" onClick={() => onDelete(offer.id)} className="text-xs font-semibold text-red-600 hover:underline">
                      {t('common.delete')}
                    </button>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}

      <OfferFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={async (input) => {
          if (editing) {
            await updateOffer.mutateAsync({ id: editing.id, patch: input })
          } else {
            await createOffer.mutateAsync(input)
          }
        }}
      />
    </div>
  )
}
