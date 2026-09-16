import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4 transition-transform duration-200 group-hover:-translate-x-1 rtl:rotate-180" aria-hidden="true">
      <path d="M12.5 15 7.5 10l5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6">
        <Link
          to="/"
          className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-neutral-500 transition-colors hover:text-brand-600 dark:text-neutral-400 dark:hover:text-brand-400"
        >
          <BackArrowIcon />
          {t('auth.backToHome')}
        </Link>

        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
            <img src="/logo.png" alt="BestellQuick" className="h-11 w-auto shrink-0 object-contain" />
            <span className="font-brand text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">BestellQuick</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <div className="animate-fade-in-up rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="mb-5 text-xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}
