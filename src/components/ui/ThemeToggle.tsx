import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context/ThemeContext'

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2v2M10 16v2M18 10h-2M4 10H2M15.36 4.64l-1.41 1.41M6.05 13.95l-1.41 1.41M15.36 15.36l-1.41-1.41M6.05 6.05L4.64 4.64"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-5" aria-hidden="true">
      <path
        d="M17 12.5A7 7 0 0 1 7.5 3a7 7 0 1 0 9.5 9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? t('common.switchToLight') : t('common.switchToDark')}
      className={`rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 ${className ?? ''}`}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
