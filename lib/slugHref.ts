/** Safe slug for links/keys when Sanity returns slug, { current }, or bad data. */
export function slugHref(slug: { current?: string | null } | string | null | undefined): string {
  if (slug == null) return ''
  if (typeof slug === 'string') return slug
  if (typeof slug === 'object' && slug.current) return String(slug.current)
  return ''
}
