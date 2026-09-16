import { useEffect, useState, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageToggle } from '@/components/layout/LanguageToggle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Button } from '@/components/ui/Button'
import { PLAN_LIMITS } from '@/lib/plans'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'

const FEATURES = [
  { key: 'feature1', gradient: 'from-amber-400 to-orange-500' },
  { key: 'feature2', gradient: 'from-teal-400 to-sky-500' },
  { key: 'feature3', gradient: 'from-sky-400 to-indigo-500' },
] as const

function QrIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6 text-white" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 14h3v3h-3zM19 14h2M14 19h2M19 19h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6 text-white" aria-hidden="true">
      <path d="M3 12h4l2 7 4-14 2 7h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="size-6 text-white" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7.5 10V7a4.5 4.5 0 0 1 9 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const FEATURE_ICONS = { feature1: QrIcon, feature2: PulseIcon, feature3: LockIcon }

export default function Landing() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header
        className={`sticky top-0 z-40 border-b transition-all duration-300 ${
          scrolled
            ? 'border-neutral-200 bg-white/80 shadow-sm backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80'
            : 'border-transparent bg-white/0 dark:bg-neutral-950/0'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-100">
            <img src="/logo.png" alt="BestellQuick" className="size-11 shrink-0 object-contain" />
            <span className="font-brand text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
              {t('app.name')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              {t('landing.ctaLogin')}
            </Link>
            <Link to="/signup">
              <Button size="sm">{t('landing.ctaSignup')}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-4 py-20 text-center sm:py-28">
          {/* Animated gradient aurora behind the hero — purely decorative */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="animate-aurora absolute -left-24 -top-24 size-96 rounded-full bg-brand-300/40 blur-3xl dark:bg-brand-500/30" />
            <div
              className="animate-aurora absolute -right-24 top-10 size-96 rounded-full bg-sky-300/30 blur-3xl dark:bg-sky-500/25"
              style={{ animationDelay: '-4s' }}
            />
            <div
              className="animate-aurora absolute bottom-0 left-1/3 size-80 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-400/20"
              style={{ animationDelay: '-8s' }}
            />
          </div>

          <img src="/logo.png" alt="" className="animate-float mx-auto mb-6 size-20 object-contain drop-shadow-lg" aria-hidden="true" />

          <h1 className="animate-fade-in-up mx-auto max-w-3xl text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl dark:text-neutral-100">
            {t('landing.heroTitle')}
          </h1>
          <p
            className="animate-fade-in-up mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400"
            style={{ animationDelay: '0.1s' }}
          >
            {t('landing.heroSubtitle')}
          </p>
          <div className="animate-fade-in-up mt-8 flex justify-center gap-3" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup">
              <Button size="lg">{t('landing.ctaSignup')}</Button>
            </Link>
          </div>
        </section>

        <section className="bg-white py-16 dark:bg-neutral-900">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">{t('landing.featuresTitle')}</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {FEATURES.map((f, i) => (
                <FeatureCard
                  key={f.key}
                  title={t(`landing.${f.key}Title`)}
                  desc={t(`landing.${f.key}Desc`)}
                  gradient={f.gradient}
                  Icon={FEATURE_ICONS[f.key]}
                  delay={i * 0.12}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">{t('landing.pricingTitle')}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <PricingCard name={t('settings.planFree')} price={PLAN_LIMITS.free.priceLabel} highlight={false} delay={0} />
            <PricingCard name={t('settings.planPro')} price={PLAN_LIMITS.pro.priceLabel} highlight delay={0.12} />
            <PricingCard name={t('settings.planAnnual')} price={PLAN_LIMITS.annual.priceLabel} highlight={false} delay={0.24} />
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-8 text-center text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        {t('app.name')} — {t('landing.footerRights')}
      </footer>
    </div>
  )
}

function FeatureCard({
  title,
  desc,
  delay,
  gradient,
  Icon,
}: {
  title: string
  desc: string
  delay: number
  gradient: string
  Icon: () => ReactElement
}) {
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>()
  return (
    <div
      ref={ref}
      data-reveal
      data-revealed={revealed}
      style={{ transitionDelay: revealed ? `${delay}s` : '0s' }}
      className="rounded-2xl border border-transparent p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-neutral-200 hover:bg-white hover:shadow-lg dark:hover:border-neutral-800 dark:hover:bg-neutral-950"
    >
      <div className={`mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md ${gradient}`}>
        <Icon />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{desc}</p>
    </div>
  )
}

function PricingCard({ name, price, highlight, delay }: { name: string; price: string; highlight: boolean; delay: number }) {
  const { t } = useTranslation()
  const { ref, revealed } = useRevealOnScroll<HTMLDivElement>()
  return (
    <div
      ref={ref}
      data-reveal
      data-revealed={revealed}
      style={{ transitionDelay: revealed ? `${delay}s` : '0s' }}
      className={`relative rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1.5 ${
        highlight
          ? 'border-brand-500 bg-gradient-to-br from-brand-50 via-white to-brand-100 shadow-lg shadow-brand-200/50 hover:shadow-xl hover:shadow-brand-300/50 dark:from-brand-900/30 dark:via-neutral-900 dark:to-brand-900/10 dark:shadow-brand-900/30'
          : 'border-neutral-200 bg-gradient-to-br from-white to-neutral-50 hover:shadow-lg dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/60'
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
          {t('landing.mostPopular')}
        </span>
      )}
      <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{name}</p>
      <p className="my-3 bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-2xl font-bold text-transparent dark:from-brand-400 dark:to-brand-300">
        {price}
      </p>
      <Link to="/signup">
        <Button variant={highlight ? 'primary' : 'outline'} className="w-full">
          {t('landing.ctaSignup')}
        </Button>
      </Link>
    </div>
  )
}
