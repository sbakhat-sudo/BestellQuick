import { type ReactNode, createContext, useContext } from 'react'
import type { Restaurant } from '@/types/database.types'

const RestaurantContext = createContext<Restaurant | null>(null)

export function RestaurantProvider({ restaurant, children }: { restaurant: Restaurant; children: ReactNode }) {
  return <RestaurantContext.Provider value={restaurant}>{children}</RestaurantContext.Provider>
}

export function useCurrentRestaurant(): Restaurant {
  const restaurant = useContext(RestaurantContext)
  if (!restaurant) throw new Error('useCurrentRestaurant must be used within RestaurantProvider (inside OnboardingGate)')
  return restaurant
}
