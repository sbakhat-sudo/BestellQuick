import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboardRestaurant } from '@/hooks/useRestaurant'
import { AuthLayout } from './AuthLayout'

export default function Signup() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const onboard = useOnboardRestaurant()
  const [restaurantName, setRestaurantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { restaurant_name: restaurantName } },
    })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      return
    }

    if (data.session) {
      try {
        await onboard.mutateAsync(restaurantName)
        navigate('/dashboard')
        return
      } catch {
        setError(t('auth.genericError'))
        setLoading(false)
        return
      }
    }

    // Email confirmation is required by this Supabase project's Auth
    // settings — the restaurant row is created on first login instead
    // (see OnboardingGate), using the restaurant_name stored above.
    setCheckEmail(true)
    setLoading(false)
  }

  if (checkEmail) {
    return (
      <AuthLayout title={t('auth.signupTitle')}>
        <p className="text-sm text-neutral-700">{t('auth.checkEmail')}</p>
        <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline">
          {t('auth.loginLink')}
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title={t('auth.signupTitle')}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label={t('auth.restaurantName')}
          required
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
        />
        <Input
          label={t('auth.email')}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label={t('auth.password')}
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          hint={t('auth.passwordHint')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" isLoading={loading} className="w-full">
          {t('auth.signupCta')}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-600">
        {t('auth.haveAccount')}{' '}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          {t('auth.loginLink')}
        </Link>
      </p>
    </AuthLayout>
  )
}
