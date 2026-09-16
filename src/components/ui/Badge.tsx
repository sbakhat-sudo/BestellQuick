import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger'

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', toneClasses[tone], className)}
      {...props}
    />
  )
}
