import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useCurrentRestaurant } from '@/context/RestaurantContext'
import { LanguageToggle } from './LanguageToggle'
import { Badge } from '@/components/ui/Badge'

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
              isActive ? 'bg-brand-600 text-white' : 'text-neutral-700 hover:bg-neutral-100',
            )
          }
        >
          {t(`nav.${item.key}`)}
        </NavLink>
      ))}
    </nav>
  )
}

export function DashboardLayout(): ReactNode {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const restaurant = useCurrentRestaurant()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-neutral-100 md:hidden"
            aria-label="menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            ☰
          </button>
          <span className="font-brand text-xl font-bold tracking-tight text-neutral-900">Vite-Fait</span>
          <Badge tone={restaurant.is_open ? 'success' : 'danger'} className="hidden sm:inline-flex">
            {restaurant.is_open ? t('dashboard.overview.open') : t('dashboard.overview.closed')}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle className="hidden sm:inline-flex" />
          <button
            type="button"
            onClick={signOut}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            {t('common.logout')}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-[57px] hidden h-[calc(100svh-57px)] w-56 shrink-0 border-r border-neutral-200 bg-white p-3 md:block">
          <NavLinks />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-20 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)}>
            <div
              className="h-full w-64 bg-white p-3 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center gap-2 px-1">
                <span className="font-brand text-xl font-bold tracking-tight">Vite-Fait</span>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <div className="mt-3 px-1">
                <LanguageToggle />
              </div>
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
