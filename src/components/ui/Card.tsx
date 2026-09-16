import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 shadow-sm transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg',
        'dark:border-neutral-800 dark:from-neutral-900 dark:to-neutral-900/60 dark:hover:border-neutral-700',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('border-b border-neutral-100 px-4 py-3 sm:px-5 dark:border-neutral-800', className)} {...props} />
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('px-4 py-4 sm:px-5', className)} {...props} />
}
