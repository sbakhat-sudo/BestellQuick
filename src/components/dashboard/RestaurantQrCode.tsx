import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeCanvas } from 'qrcode.react'
import { getPublicRestaurantUrl } from '@/lib/url'
import { Button } from '@/components/ui/Button'

export function RestaurantQrCode({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const canvasRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const url = getPublicRestaurantUrl(slug)
  const qrValue = `${url}?src=qr`

  const onDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `bestellquick-qr-${slug}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const onCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
      <div ref={canvasRef} className="rounded-xl border border-neutral-200 p-3">
        <QRCodeCanvas value={qrValue} size={160} level="M" includeMargin />
      </div>
      <div className="flex flex-1 flex-col gap-2 text-center sm:text-start">
        <p className="break-all text-sm text-neutral-600">{url}</p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <Button size="sm" variant="outline" onClick={onDownload}>
            {t('common.download')}
          </Button>
          <Button size="sm" variant="outline" onClick={onCopy}>
            {copied ? t('common.linkCopied') : t('common.copyLink')}
          </Button>
        </div>
      </div>
    </div>
  )
}
