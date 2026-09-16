import { type FormEvent, type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
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

function SidebarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 4v16" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

const SIDEBAR_STORAGE_KEY = 'bestellquick-sidebar-open'

export function DashboardLayout(): ReactNode {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const restaurant = useCurrentRestaurant()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) !== 'false')

  const toggleSidebar = () => {
    setSidebarOpen((open) => {
      const next = !open
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }

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
          <button
            type="button"
            className="hidden rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 md:inline-flex dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            aria-label={t('common.toggleSidebar')}
            aria-pressed={sidebarOpen}
            onClick={toggleSidebar}
          >
            <SidebarIcon />
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
        <aside
          className={clsx(
            'sticky top-[57px] hidden h-[calc(100svh-57px)] shrink-0 flex-col justify-between overflow-hidden border-neutral-200 bg-white transition-all duration-300 ease-out md:flex dark:border-neutral-800 dark:bg-neutral-900',
            sidebarOpen ? 'w-56 border-r p-3 opacity-100' : 'w-0 border-r-0 p-0 opacity-0',
          )}
        >
          <div className="w-56 shrink-0">
            <NavLinks />
          </div>
          <div className="w-56 shrink-0">
            <RestaurantFooter />
          </div>
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

        <main key={location.pathname} className="animate-fade-in-up min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

