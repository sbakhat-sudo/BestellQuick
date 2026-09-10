import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'ع' },
] as const

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { i18n, t } = useTranslation()

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={`inline-flex items-center rounded-full border border-neutral-200 bg-white p-0.5 text-sm ${className}`}
    >
      {LANGS.map((lang) => {
        const active = i18n.resolvedLanguage === lang.code
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => i18n.changeLanguage(lang.code)}
            aria-pressed={active}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              active ? 'bg-brand-600 text-white' : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}
