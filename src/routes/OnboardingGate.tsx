import { type FormEvent, type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/context/AuthContext'
import { RestaurantProvider } from '@/context/RestaurantContext'
import { useOnboardRestaurant, useRestaurant } from '@/hooks/useRestaurant'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function OnboardingGate({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { data: restaurant, isLoading } = useRestaurant()
  const onboard = useOnboardRestaurant()
  const [name, setName] = useState((user?.user_metadata?.restaurant_name as string | undefined) ?? '')
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!restaurant) {
    const onSubmit = async (e: FormEvent) => {
      e.preventDefault()
      setError(null)
      try {
        await onboard.mutateAsync(name)
      } catch {
        setError(t('auth.genericError'))
      }
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
        <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-lg font-bold text-neutral-900">{t('auth.signupTitle')}</h1>
          <Input label={t('auth.restaurantName')} required value={name} onChange={(e) => setName(e.target.value)} />
          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" isLoading={onboard.isPending} className="mt-4 w-full">
            {t('common.confirm')}
          </Button>
        </form>
      </div>
    )
  }

  return <RestaurantProvider restaurant={restaurant}>{children}</RestaurantProvider>
}
