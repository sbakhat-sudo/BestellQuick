import { type SelectHTMLAttributes, forwardRef, useId } from 'react'
import clsx from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, id, className, children, ...props }, ref) => {
  const generatedId = useId()
  const selectId = id ?? generatedId
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={clsx('w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900', className)}
        {...props}
      >
        {children}
      </select>
    </div>
  )
})
Select.displayName = 'Select'
