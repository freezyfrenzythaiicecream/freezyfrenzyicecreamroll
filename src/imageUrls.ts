/**
 * Resolved display URL for a built-in asset, using server-backed overrides when set.
 * @param overrideKey When set (e.g. `menu:42`), lookups use this key so multiple slots can share the same default `canonicalSrc`.
 */
export function resolveImageUrl(
  canonicalSrc: string,
  overrides: Record<string, string> | undefined,
  overrideKey?: string
): string {
  if (!overrides) return canonicalSrc;
  const k = overrideKey ?? canonicalSrc;
  const o = overrides[k];
  return o && o.length > 0 ? o : canonicalSrc;
}

/** Stable config key for a menu card image override (per item, not per default file path). */
export function menuItemImageOverrideKey(itemId: number): string {
  return `menu:${itemId}`;
}

/** True for site photos and the shared branding logo staff may replace. */
export function isReplaceableImageUrl(url: string): boolean {
  if (!url) return false;
  if (url.includes('/images/rolls/')) return true;
  if (url === '/images/logo.png') return true;
  return (
    url === '/images/smoothie.jpg' ||
    url === '/images/hotbev.jpg' ||
    url === '/images/milktea.jpg'
  );
}
