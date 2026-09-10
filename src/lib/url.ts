export function getPublicRestaurantUrl(slug: string): string {
  return `${window.location.origin}/r/${slug}`
}
