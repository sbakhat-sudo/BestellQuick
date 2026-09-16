import { type FormEvent, type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { LanguageToggle } from './LanguageToggle'
import { Badge } from '@/components/ui/Badge'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const NAV_ITEMS: { to: string; end: boolean; key: string }[] = [
  { to: '/dashboard', end: true, key: 'overview' },
  { to: '/dashboard/menu', end: false, key: 'menu' },
  { to: '/dashboard/orders', end: false, key: 'orders' },
  { to: '/dashboard/offers', end: false, key: 'offers' },
  { to: '/dashboard/marketing', end: false, key: 'marketing' },
  { to: '/dashboard/analytics', end: false, key: 'analytics' },
  { to: '/dashboard/settings', end: false, key: 'settings' },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation()
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            clsx(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-brand-600 text-white' : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
            )
          }
        >
          {t(`nav.${item.key}`)}
        </NavLink>
      ))}
    </nav>
  )
}

function LogoMark() {
  return <img src="/logo.png" alt="BestellQuick" className="size-11 shrink-0 object-contain" />
}

function RestaurantFooter() {
  const { t } = useTranslation()
  const restaurant = useCurrentRestaurant()
  const planLabel = t(`settings.plan${restaurant.plan[0].toUpperCase()}${restaurant.plan.slice(1)}`)

  return (
    <div className="flex items-center gap-2.5 border-t border-neutral-100 px-1 pt-3 dark:border-neutral-800">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
        {restaurant.name.charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">{restaurant.name}</p>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          {t('nav.settings')} · {planLabel}
        </p>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4 text-neutral-400" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DashboardLayout(): ReactNode {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const restaurant = useCurrentRestaurant()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate(search.trim() ? `/dashboard/orders?q=${encodeURIComponent(search.trim())}` : '/dashboard/orders')
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 sm:px-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-neutral-100 md:hidden dark:hover:bg-neutral-800"
            aria-label="menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            ☰
          </button>
          <div className="flex items-center gap-1.5">
            <LogoMark />
            <span className="font-brand text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">BestellQuick</span>
          </div>
          <Badge tone={restaurant.is_open ? 'success' : 'danger'} className="hidden sm:inline-flex">
            {restaurant.is_open ? t('dashboard.overview.open') : t('dashboard.overview.closed')}
          </Badge>
        </div>

        <form onSubmit={onSearchSubmit} className="hidden max-w-md flex-1 md:block">
          <label className="relative block">
            <span className="absolute inset-y-0 start-3 flex items-center">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('dashboard.overview.searchPlaceholder')}
              className="w-full rounded-full border border-neutral-200 bg-neutral-50 py-2 ps-9 pe-4 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-brand-400 focus:bg-white dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:focus:bg-neutral-900"
            />
          </label>
        </form>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NavLink
            to="/dashboard/settings"
            aria-label={t('nav.settings')}
            className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <SettingsIcon />
          </NavLink>
          <LanguageToggle className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={signOut}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            {t('common.logout')}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-[57px] hidden h-[calc(100svh-57px)] w-56 shrink-0 flex-col justify-between border-r border-neutral-200 bg-white p-3 md:flex dark:border-neutral-800 dark:bg-neutral-900">
          <NavLinks />
          <RestaurantFooter />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)}>
            <div
              className="flex h-full w-64 flex-col justify-between bg-white p-3 shadow-lg dark:bg-neutral-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="mb-3 flex items-center gap-1.5 px-1">
                  <LogoMark />
                  <span className="font-brand text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">BestellQuick</span>
                </div>
                <NavLinks onNavigate={() => setMobileOpen(false)} />
                <div className="mt-3 px-1">
                  <LanguageToggle />
                </div>
              </div>
              <RestaurantFooter />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

