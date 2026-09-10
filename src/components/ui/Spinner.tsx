export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="loading"
      className={`inline-block size-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent ${className}`}
    />
  )
}
