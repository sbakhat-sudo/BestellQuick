/**
 * Extracts a human-readable message from a thrown value. Supabase's
 * PostgrestError (thrown by every `supabase.from(...).update()/insert()`
 * call) is a plain object shape ({ message, details, hint, code }), not an
 * instance of the native Error class, so a naive `err instanceof Error`
 * check silently swallows the real database error message and falls back
 * to a generic one instead.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return fallback
}
