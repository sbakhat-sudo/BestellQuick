import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

interface ImageUploadProps {
  label: string
  value: string | null
  onUpload: (file: File) => Promise<void>
}

export function ImageUpload({ label, value, onUpload }: ImageUploadProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutral-800">{label}</span>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="size-16 rounded-lg object-cover" />
        ) : (
          <div className="flex size-16 items-center justify-center rounded-lg bg-neutral-100 text-xs text-neutral-400">
            {t('common.photo')}
          </div>
        )}
        <Button type="button" variant="outline" size="sm" isLoading={uploading} onClick={() => inputRef.current?.click()}>
          {t('menu.uploadPhoto')}
        </Button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      </div>
    </div>
  )
}
