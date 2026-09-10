import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthLayout } from './AuthLayout'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(t('auth.invalidCredentials'))
      return
    }
    navigate('/dashboard')
  }

  return (
    <AuthLayout title={t('auth.loginTitle')}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" isLoading={loading} className="w-full">
          {t('auth.loginCta')}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-600">
        {t('auth.noAccount')}{' '}
        <Link to="/signup" className="font-semibold text-brand-700 hover:underline">
          {t('auth.signupLink')}
        </Link>
      </p>
    </AuthLayout>
  )
}
