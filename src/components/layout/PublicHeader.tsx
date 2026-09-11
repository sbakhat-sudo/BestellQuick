import type { Restaurant } from '@/types/database.types'
import { LanguageToggle } from './LanguageToggle'

export function PublicHeader({ restaurant }: { restaurant: Restaurant }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      {restaurant.cover_photo_url && (
        <div className="h-32 w-full overflow-hidden sm:h-44">
          <img src={restaurant.cover_photo_url} alt="" className="size-full object-cover" />
        </div>
      )}
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt={restaurant.name} className="size-12 rounded-full object-cover" />
          ) : (
            // Fallback avatar until this restaurant uploads its own logo (Settings)
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
              {restaurant.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <h1 className="text-lg font-bold text-neutral-900">{restaurant.name}</h1>
            {restaurant.address && <p className="text-xs text-neutral-500">{restaurant.address}</p>}
          </div>
        </div>
        <LanguageToggle />
      </div>
    </header>
  )
}
