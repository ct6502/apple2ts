import { compareDiskFilenames } from "../../../common/zip_utils"

export const normalizeDownloadUrl = (url: string): string => {
  if (!url) return url
  let trimmed = url.trim()
  const sceneOrgMatch = trimmed.match(/^https?:\/\/files\.scene\.org\/(?:view|get)\/(.+)$/i)
  if (sceneOrgMatch) {
    trimmed = `https://archive.scene.org/pub/${sceneOrgMatch[1]}`
  }
  if (trimmed.includes("marqueeedesign_")) {
    trimmed = trimmed.replace("marqueeedesign_", "marqueedesign_")
  }
  const brutalLocsMatch = trimmed.match(/^https?:\/\/(?:www\.)?brutaldeluxe\.fr\/products\/french\/locs\/(.+)$/i)
  if (brutalLocsMatch) {
    trimmed = `https://web.archive.org/web/0id_/http://www.brutaldeluxe.fr/products/french/locs/${brutalLocsMatch[1]}`
  }
  return trimmed
}

export const getWaybackRawUrl = (url: string): string => {
  if (!url) return ""
  const trimmed = url.trim()
  if (!/^https?:/i.test(trimmed)) return ""
  if (/web\.archive\.org|archive\.org/i.test(trimmed)) return ""
  return `https://web.archive.org/web/0id_/${trimmed}`
}

export const demoZooDiskExtensions = [
  ".hdv", ".2mg", ".dsk", ".woz", ".po", ".do", ".bin", ".bas", ".2img", ".d13", ".dc", ".img",
  ".zip", ".7z", ".gz", ".tar"
]

export const demoZooNonDiskExtensions = [
  ".nib", // .nib is obsolete and not supported by decodedisk
  ".mp4", ".webm", ".mkv", ".avi", ".mov", ".flv", ".wmv", ".m4v",
  ".mp3", ".ogg", ".flac", ".wav", ".aac", ".m4a",
  ".pdf", ".txt", ".nfo", ".diz", ".doc",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"
]

export const isDemoZooDiskUrl = (url: string): boolean => {
  if (!url) return false
  try {
    const pathname = decodeURIComponent(new URL(url).pathname).toLowerCase()
    if (demoZooNonDiskExtensions.some(ext => pathname.endsWith(ext))) return false
    return demoZooDiskExtensions.some(ext => pathname.endsWith(ext))
  } catch {
    return false
  }
}

export const isDemoZooNonDiskUrl = (url: string): boolean => {
  if (!url) return false
  try {
    const pathname = decodeURIComponent(new URL(url).pathname).toLowerCase()
    return demoZooNonDiskExtensions.some(ext => pathname.endsWith(ext))
  } catch {
    return false
  }
}

/**
 * Extract direct disk download links from a public DemoZoo production page HTML.
 */
export const parseDemoZooProductionPageHtml = (html: string, pageUrl = "https://demozoo.org"): string[] => {
  const candidates: string[] = []

  // Try to isolate the downloads panel if present for higher accuracy
  const downloadsMatch = html.match(/<div\b[^>]*class=["'][^"']*downloads_panel[^"']*["'][\s\S]*?<\/div>\s*<\/div>/i)
  const searchHtml = downloadsMatch ? downloadsMatch[0] : html

  const hrefPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  for (const match of searchHtml.matchAll(hrefPattern)) {
    const rawHref = match[1].trim()
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) continue

    try {
      let resolved = new URL(rawHref, pageUrl).toString()
      resolved = normalizeDownloadUrl(resolved)
      if (isDemoZooDiskUrl(resolved)) {
        if (!candidates.includes(resolved)) candidates.push(resolved)
      }
    } catch {
      // Ignore invalid URLs
    }
  }

  // If nothing found in downloads panel, search the entire page
  if (candidates.length === 0 && searchHtml !== html) {
    for (const match of html.matchAll(hrefPattern)) {
      const rawHref = match[1].trim()
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) continue
      try {
        let resolved = new URL(rawHref, pageUrl).toString()
        resolved = normalizeDownloadUrl(resolved)
        if (isDemoZooDiskUrl(resolved)) {
          if (!candidates.includes(resolved)) candidates.push(resolved)
        }
      } catch {
        // Ignore
      }
    }
  }

  return sortDemoZooDisks(candidates)
}

/**
 * Natural sort disk URLs so Disk 1 / Side A / Boot / Face 1 comes first.
 */
export const sortDemoZooDisks = (urls: string[]): string[] => {
  const getBasename = (u: string) => {
    try {
      const p = decodeURIComponent(new URL(u).pathname)
      return p.substring(p.lastIndexOf("/") + 1)
    } catch {
      return u
    }
  }

  return [...urls].sort((a, b) => {
    return compareDiskFilenames(getBasename(a), getBasename(b))
  })
}

export type CorsFetcher = (url: string) => Promise<Response | null>

/**
 * Fetch HTML/text from external server with CORS proxy support.
 */
export const fetchExternalServerText = async (
  url: string,
  corsFetcher?: CorsFetcher,
): Promise<string> => {
  if (corsFetcher) {
    const corsResponse = await corsFetcher(url)
    if (corsResponse?.ok) return corsResponse.text()
  }

  try {
    const response = await fetch(url)
    if (response.ok) return response.text()
  } catch {
    // Fall through
  }

  const waybackUrl = getWaybackRawUrl(url)
  if (waybackUrl) {
    if (corsFetcher) {
      const wbCors = await corsFetcher(waybackUrl)
      if (wbCors?.ok) return wbCors.text()
    }
    try {
      const wbRes = await fetch(waybackUrl)
      if (wbRes.ok) return wbRes.text()
    } catch {
      // Fall through
    }
  }

  throw new Error(`External server fetch failed: ${url}`)
}

/**
 * Extract disk download links from external HTML pages (e.g. Pouet, Brutal Deluxe, Deater, GitHub).
 */
export const extractDisksFromHtml = (html: string, baseUrl: string): string[] => {
  const candidates: string[] = []
  const hrefPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi

  for (const match of html.matchAll(hrefPattern)) {
    const rawHref = match[1].trim()
    const linkText = match[2].trim()
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) continue

    try {
      let resolved = new URL(rawHref, baseUrl).toString()
      resolved = normalizeDownloadUrl(resolved)

      // Check if it's a direct disk download
      if (isDemoZooDiskUrl(resolved)) {
        if (!candidates.includes(resolved)) candidates.push(resolved)
        continue
      }

      // Pouet special case: download link to scene.org or ftp.untergrund.net
      if (/pouet\.net/i.test(baseUrl) && (/download/i.test(linkText) || /download/i.test(rawHref))) {
        if (!isDemoZooNonDiskUrl(resolved) && !candidates.includes(resolved)) {
          candidates.push(resolved)
        }
      }
    } catch {
      // Ignore malformed URLs
    }
  }

  return sortDemoZooDisks(candidates)
}

/**
 * Resolve candidate URL: if it's already a disk image, return it.
 * If it's a webpage (Pouet, Brutal Deluxe, Deater, GitHub), crawl and extract disk URLs.
 */
export const resolveExternalDownloadUrls = async (
  rawUrl: string,
  corsFetcher?: CorsFetcher,
): Promise<string[]> => {
  const url = normalizeDownloadUrl(rawUrl)
  try {
    new URL(url)
  } catch {
    return []
  }

  if (isDemoZooDiskUrl(url)) {
    return [url]
  }

  if (isDemoZooNonDiskUrl(url)) {
    return []
  }

  try {
    const html = await fetchExternalServerText(url, corsFetcher)
    const extracted = extractDisksFromHtml(html, url)
    if (extracted.length > 0) {
      return extracted
    }
  } catch (error) {
    console.warn(`Unable to resolve external download page: ${url}`, error)
  }

  return []
}
