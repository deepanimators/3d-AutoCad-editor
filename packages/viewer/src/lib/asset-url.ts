import { loadAssetUrl } from '@aruct/core'

export const ASSETS_CDN_URL = process.env.NEXT_PUBLIC_ASSETS_CDN_URL || 'https://www.aruct.com'

// Bare domain stored in legacy scene data — rewrite to canonical www origin.
const LEGACY_CDN_ORIGIN = 'https://aruct.com'

function normalizeLegacyOrigin(url: string): string {
  if (url.startsWith(LEGACY_CDN_ORIGIN + '/') || url === LEGACY_CDN_ORIGIN) {
    return new URL(ASSETS_CDN_URL).origin + url.slice(LEGACY_CDN_ORIGIN.length)
  }
  return url
}

/**
 * Resolves an asset URL to the appropriate format:
 * - If URL starts with http:// or https://, return as-is (external URL, with legacy origin normalization)
 * - If URL starts with asset://, resolve from IndexedDB storage
 * - If URL starts with /, prepend CDN URL (absolute path)
 * - Otherwise, prepend CDN URL (relative path)
 */
export async function resolveAssetUrl(url: string | undefined | null): Promise<string | null> {
  if (!url) return null

  // External URL - normalize legacy bare-domain then return
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return normalizeLegacyOrigin(url)
  }

  // IndexedDB asset - resolve from storage
  if (url.startsWith('asset://')) {
    return loadAssetUrl(url)
  }

  // Absolute or relative path - prepend CDN URL
  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  return `${ASSETS_CDN_URL}${normalizedPath}`
}

/**
 * Synchronous version for URLs that don't need IndexedDB resolution
 * Only use this if you're sure the URL is not an asset:// URL
 */
export function resolveCdnUrl(url: string | undefined | null): string | null {
  if (!url) return null

  // External URL - normalize legacy bare-domain then return
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return normalizeLegacyOrigin(url)
  }

  // Don't use this for asset:// URLs - use resolveAssetUrl instead
  if (url.startsWith('asset://')) {
    console.warn('Use resolveAssetUrl() for asset:// URLs, not resolveCdnUrl()')
    return null
  }

  // Absolute or relative path - prepend CDN URL
  const normalizedPath = url.startsWith('/') ? url : `/${url}`
  return `${ASSETS_CDN_URL}${normalizedPath}`
}
