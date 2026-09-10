import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { useSendWhatsappCampaign, useWhatsappCampaigns } from '@/hooks/useWhatsappCampaigns'
import { isWhatsappEnabled } from '@/lib/plans'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

export default function Marketing() {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const enabled = isWhatsappEnabled(restaurant.plan)
  const { data: campaigns, isLoading } = useWhatsappCampaigns()
  const sendCampaign = useSendWhatsappCampaign()
  const [message, setMessage] = useState('')
  const [segment, setSegment] = useState('all')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await sendCampaign.mutateAsync({ message, targetSegment: segment })
    setMessage('')
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-neutral-900">{t('marketing.title')}</h1>

      {!enabled ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-neutral-600">{t('marketing.proOnly')}</p>
            <Link to="/dashboard/settings">
              <Button>{t('marketing.upgradeCta')}</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-neutral-900">{t('marketing.composeTitle')}</h2>
            </CardHeader>
            <CardBody>
              <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <Textarea
                  label={t('marketing.message')}
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Select label={t('marketing.targetSegment')} value={segment} onChange={(e) => setSegment(e.target.value)} className="max-w-xs">
                  <option value="all">{t('marketing.segmentAll')}</option>
                  <option value="inactive">{t('marketing.segmentInactive')}</option>
                </Select>
                <div>
                  <Button type="submit" isLoading={sendCampaign.isPending}>
                    {sendCampaign.isPending ? t('marketing.sending') : t('marketing.send')}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-neutral-900">{t('marketing.history')}</h2>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Spinner />
              ) : !campaigns || campaigns.length === 0 ? (
                <p className="text-sm text-neutral-500">{t('marketing.noCampaigns')}</p>
              ) : (
                <ul className="flex flex-col divide-y divide-neutral-100">
                  {campaigns.map((c) => (
                    <li key={c.id} className="py-2">
                      <p className="text-sm text-neutral-900">{c.message}</p>
                      <p className="text-xs text-neutral-500">
                        {c.sent_at ? new Date(c.sent_at).toLocaleString() : t('marketing.sending')} · {c.recipients_count}{' '}
                        {t('marketing.recipients')}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  )
}
