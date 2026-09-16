import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { usePublicMenuItems, usePublicOffers, usePublicRestaurant } from '@/hooks/usePublicRestaurant'
import { useLogAnalyticsEvent } from '@/hooks/useLogAnalyticsEvent'
import { CartProvider, useCart } from '@/context/CartContext'
import { PublicHeader } from '@/components/layout/PublicHeader'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CartModal } from '@/components/public/CartModal'
import type { AccessSource } from '@/types/database.types'

function RestaurantMenuContent({ slug, accessSource }: { slug: string; accessSource: AccessSource }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: restaurant, isLoading: loadingRestaurant } = usePublicRestaurant(slug)
  const { data: menuItems, isLoading: loadingMenu } = usePublicMenuItems(restaurant?.id)
  const { data: offers } = usePublicOffers(restaurant?.id)
  const { addItem, count, total } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  useLogAnalyticsEvent(restaurant?.id, accessSource === 'qr' ? 'qr_scan' : 'link_click')

  const grouped = useMemo(() => {
    const map = new Map<string, typeof menuItems>()
    for (const item of menuItems ?? []) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return Array.from(map.entries())
  }, [menuItems])

  if (loadingRestaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!restaurant) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-24 dark:bg-neutral-950">
      <PublicHeader restaurant={restaurant} />

      <main className="animate-fade-in-up mx-auto max-w-3xl px-4 py-6">
        {!restaurant.is_open && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-900 dark:bg-amber-950">
            <p className="font-semibold text-amber-900 dark:text-amber-200">{t('publicMenu.closedTitle')}</p>
            <p className="text-sm text-amber-800 dark:text-amber-300">{t('publicMenu.closedMessage')}</p>
          </div>
        )}

        {offers && offers.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">{t('publicMenu.offersTitle')}</h2>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="w-56 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                >
                  {offer.photo_url && <img src={offer.photo_url} alt="" className="h-28 w-full object-cover" />}
                  <div className="p-3">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100">{offer.title}</p>
                    {offer.description && (
                      <p className="line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">{offer.description}</p>
                    )}
                    {offer.price != null && (
                      <p className="mt-1 font-semibold text-brand-700 dark:text-brand-400">
                        {Number(offer.price).toFixed(2)} {t('common.currency')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <h2 className="mb-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">{t('publicMenu.menuTitle')}</h2>

        {loadingMenu ? (
          <Spinner />
        ) : grouped.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">{t('publicMenu.emptyMenu')}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {grouped.map(([category, categoryItems]) => (
              <div key={category}>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">{category}</h3>
                <div className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
                  {categoryItems!.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 transition-colors duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    >
                      {item.photo_url && <img src={item.photo_url} alt="" className="size-14 shrink-0 rounded-lg object-cover" />}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{item.name}</p>
                        {item.description && (
                          <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">{item.description}</p>
                        )}
                        <p className="mt-0.5 text-sm font-semibold text-brand-700 dark:text-brand-400">
                          {Number(item.price).toFixed(2)} {t('common.currency')}
                        </p>
                      </div>
                      {item.status === 'out_of_stock' ? (
                        <Badge tone="danger">{t('publicMenu.outOfStock')}</Badge>
                      ) : (
                        <Button
                          size="sm"
                          disabled={!restaurant.is_open}
                          onClick={() => addItem(item)}
                        >
                          {t('publicMenu.addToCart')}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {count > 0 && restaurant.is_open && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="animate-fade-in-up fixed inset-x-4 bottom-4 z-40 flex items-center justify-between rounded-xl bg-brand-600 px-5 py-3 text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 sm:inset-x-auto sm:right-4 sm:w-80"
        >
          <span className="font-semibold">
            {t('publicMenu.cart')} ({count})
          </span>
          <span className="font-semibold">
            {total.toFixed(2)} {t('common.currency')}
          </span>
        </button>
      )}

      <CartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        restaurantId={restaurant.id}
        accessSource={accessSource}
        onOrderPlaced={(orderId) => navigate(`/r/${slug}/order/${orderId}`)}
      />
    </div>
  )
}

export default function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const accessSource: AccessSource = searchParams.get('src') === 'qr' ? 'qr' : 'link'

  if (!slug) return <Navigate to="/" replace />

  return (
    <CartProvider>
      <RestaurantMenuContent slug={slug} accessSource={accessSource} />
    </CartProvider>
  )
}
