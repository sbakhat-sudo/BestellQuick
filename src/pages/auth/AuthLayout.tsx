import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LanguageToggle } from '@/components/layout/LanguageToggle'

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 px-4 py-8">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-neutral-900">
            <img src="/logo.png" alt="Vite-Fait" className="size-14 shrink-0 object-contain" />
            <span className="font-brand text-xl font-bold tracking-tight">Vite-Fait</span>
          </Link>
          <LanguageToggle />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="mb-5 text-xl font-bold text-neutral-900">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}
