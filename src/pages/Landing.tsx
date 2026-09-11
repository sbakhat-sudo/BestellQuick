import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { Button } from '@/components/ui/Button'
import { PLAN_LIMITS } from '@/lib/plans'

const FEATURES = ['feature1', 'feature2', 'feature3'] as const

export default function Landing() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-neutral-900">
            <span className="font-brand text-xl font-bold tracking-tight">{t('app.name')}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link to="/login" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
              {t('landing.ctaLogin')}
            </Link>
            <Link to="/signup">
              <Button size="sm">{t('landing.ctaSignup')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">{t('landing.heroTitle')}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600">{t('landing.heroSubtitle')}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/signup">
              <Button size="lg">{t('landing.ctaSignup')}</Button>
            </Link>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold text-neutral-900">{t('landing.featuresTitle')}</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div key={f} className="text-center">
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900">{t(`landing.${f}Title`)}</h3>
                  <p className="text-sm text-neutral-600">{t(`landing.${f}Desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold text-neutral-900">{t('landing.pricingTitle')}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <PricingCard name={t('settings.planFree')} price={PLAN_LIMITS.free.priceLabel} highlight={false} />
            <PricingCard name={t('settings.planPro')} price={PLAN_LIMITS.pro.priceLabel} highlight />
            <PricingCard name={t('settings.planAnnual')} price={PLAN_LIMITS.annual.priceLabel} highlight={false} />
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-8 text-center text-sm text-neutral-500">
        {t('app.name')} — {t('landing.footerRights')}
      </footer>
    </div>
  )
}

function PricingCard({ name, price, highlight }: { name: string; price: string; highlight: boolean }) {
  const { t } = useTranslation()
  return (
    <div
      className={`rounded-2xl border p-6 text-center ${
        highlight ? 'border-brand-600 bg-brand-50 shadow-md' : 'border-neutral-200 bg-white'
      }`}
    >
      <p className="text-lg font-semibold text-neutral-900">{name}</p>
      <p className="my-3 text-2xl font-bold text-brand-700">{price}</p>
      <Link to="/signup">
        <Button variant={highlight ? 'primary' : 'outline'} className="w-full">
          {t('landing.ctaSignup')}
        </Button>
      </Link>
    </div>
  )
}
