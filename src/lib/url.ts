// Falls back to window.location.origin for local dev, but on a real
// deployment this must be set to the fixed production domain. Without it,
// the QR code/link would encode whichever URL the dashboard happens to be
// open on — including a Vercel preview-deployment URL, which is behind
// Vercel's own authentication wall and would send scanning customers to a
// Vercel login page instead of the menu.
const PUBLIC_APP_URL = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.replace(/\/$/, '')

export function getPublicRestaurantUrl(slug: string): string {
  const origin = PUBLIC_APP_URL || window.location.origin
  return `${origin}/r/${slug}`
}
