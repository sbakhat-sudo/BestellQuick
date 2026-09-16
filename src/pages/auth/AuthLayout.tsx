import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
            <img src="/logo.png" alt="Vite-Fait" className="size-11 shrink-0 object-contain" />
            <span className="font-brand text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">Vite-Fait</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="mb-5 text-xl font-bold text-neutral-900 dark:text-neutral-100">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}
