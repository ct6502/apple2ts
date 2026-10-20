import { iconKey, iconData, iconName } from "../../img/iconfunctions"

export const internetArchiveUrlProtocol = "a2ia://"

type ProxyCandidate = {
  id: string,
  url: string,
}

const PROXY_SCORE_STORAGE_PREFIX = "proxy-score:"
const proxyScoreMemoryCache = new Map<string, Record<string, number>>()

const getProxyTargetDomain = (url: string): string => {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ""
  }
}

const getProxyScoreRecord = (domain: string): Record<string, number> => {
  if (!domain) return {}

  const cached = proxyScoreMemoryCache.get(domain)
  if (cached) return cached

  try {
    const raw = sessionStorage.getItem(PROXY_SCORE_STORAGE_PREFIX + domain)
    if (!raw) {
      const empty = {}
      proxyScoreMemoryCache.set(domain, empty)
      return empty
    }

    const parsed = JSON.parse(raw) as Record<string, number>
    proxyScoreMemoryCache.set(domain, parsed)
    return parsed
  } catch {
    const empty = {}
    proxyScoreMemoryCache.set(domain, empty)
    return empty
  }
}

const persistProxyScoreRecord = (domain: string, record: Record<string, number>) => {
  if (!domain) return
  proxyScoreMemoryCache.set(domain, record)
  try {
    sessionStorage.setItem(PROXY_SCORE_STORAGE_PREFIX + domain, JSON.stringify(record))
  } catch {
    // sessionStorage may be unavailable; keep in-memory score only.
  }
}

const noteProxyScore = (domain: string, proxyId: string, success: boolean) => {
  if (!domain || !proxyId) return
  const record = { ...getProxyScoreRecord(domain) }
  const current = record[proxyId] || 0
  const updated = success ? Math.min(20, current + 3) : Math.max(-20, current - 1)
  record[proxyId] = updated
  persistProxyScoreRecord(domain, record)
}

const sortProxyCandidatesForDomain = (domain: string, candidates: ProxyCandidate[]): ProxyCandidate[] => {
  const record = getProxyScoreRecord(domain)
  return candidates
    .map((candidate, index) => ({
      candidate,
      index,
      score: record[candidate.id] || 0,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.index - b.index
    })
    .map(entry => entry.candidate)
}

const getCorsProxyCandidates = (url: string): ProxyCandidate[] => {
  const encodedUrl = encodeURIComponent(url)
  return [
    { id: "corsfix-raw", url: "https://proxy.corsfix.com/?" + url },
    { id: "corsfix-param", url: "https://proxy.corsfix.com/?url=" + encodedUrl },
    { id: "corsfix-encoded", url: "https://proxy.corsfix.com/?" + encodedUrl },
  ]
}

const iaResolveCache = new Map<string, {
  resolvedUrl: string,
  fileSize: number,
  expiresAt: number,
  allUrls?: string[],
}>()
const iaResolveInflight = new Map<string, Promise<[URL | undefined, number, URL[]?]>>()

const IA_CACHE_TTL_MS = 30 * 60 * 1000
const IA_NEGATIVE_CACHE_TTL_MS = 2 * 60 * 1000

const fetchCloudflareProxy = async (url: string): Promise<Response | null> => {
  if (typeof window === "undefined" || !/\.pages\.dev$/i.test(window.location.hostname)) return null
  try {
    const response = await fetch(`/api/disk-direct?url=${encodeURIComponent(url)}`)
    return response.ok ? response : null
  } catch {
    return null
  }
}

export const generateUrlFromInternetArchiveId = (identifier: string): URL => {
  return new URL(internetArchiveUrlProtocol + identifier)
}

export const clearIaResolveCache = (identifier: string) => {
  iaResolveCache.delete(identifier)
}

export interface IaResolvedDiskFiles {
  primaryUrl?: URL
  fileSize: number
  allUrls?: URL[]
}

const DISK_EXTENSIONS = [".woz", ".dsk", ".po", ".hdv", ".2mg", ".do"]

export const resolveIaDiskFilesFromDetails = (
  identifier: string,
  json: { metadata?: Record<string, unknown>; files?: Record<string, { size?: string | number; format?: string }> }
): IaResolvedDiskFiles => {
  if (!json.files || typeof json.files !== "object") {
    return { fileSize: -1 }
  }

  const files = Object.keys(json.files)

  const isIgnored = (file: string) => {
    const lower = file.toLowerCase()
    if (lower.startsWith("/history/") || lower.includes("/history/") || lower.endsWith(".~1~")) return true
    if (lower.endsWith(".xml") || lower.endsWith(".sqlite") || lower.endsWith(".torrent")) return true
    if (lower.includes("_screenshot.") || lower.includes("_thumb.") || lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif")) return true
    if (lower.endsWith(".txt") || lower.endsWith(".pdf") || lower.endsWith(".nib")) return true
    return false
  }

  const validFiles = files.filter(f => !isIgnored(f))

  const directDisks: string[] = []
  const playableDisks: string[] = []
  const zipFiles: string[] = []

  for (const file of validFiles) {
    const lower = file.toLowerCase()
    const isDisk = DISK_EXTENSIONS.some(ext => lower.endsWith(ext))
    if (isDisk) {
      if (lower.includes("00playable")) {
        playableDisks.push(file)
      } else {
        directDisks.push(file)
      }
    } else if (lower.endsWith(".zip")) {
      if (!lower.includes("extra")) {
        zipFiles.push(file)
      }
    }
  }

  const naturalSort = (arr: string[]) => {
    arr.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
  }

  // 1. Show All direct disk files (.dsk, .po, .woz, etc.)
  if (directDisks.length > 0) {
    naturalSort(directDisks)
    const allUrls = directDisks.map(f => new URL(`https://archive.org/download/${identifier}${f}`))
    const primaryUrl = allUrls[0]
    const fileSize = parseInt(String(json.files[directDisks[0]]?.size || "-1"), 10)
    return { primaryUrl, fileSize, allUrls }
  }

  // 2. Primary .zip archive (e.g. woz-a-day collection or 4am crack)
  if (zipFiles.length > 0) {
    naturalSort(zipFiles)
    const preferredZip = zipFiles.find(f => /woz-a-day|4am/i.test(f)) || zipFiles[0]
    const primaryUrl = new URL(`https://archive.org/download/${identifier}${preferredZip}`)
    const fileSize = parseInt(String(json.files[preferredZip]?.size || "-1"), 10)
    return { primaryUrl, fileSize, allUrls: [primaryUrl] }
  }

  // 3. Fallback: 00playable or emulator_ext match
  if (playableDisks.length > 0) {
    naturalSort(playableDisks)
    const primaryUrl = new URL(`https://archive.org/download/${identifier}${playableDisks[0]}`)
    const fileSize = parseInt(String(json.files[playableDisks[0]]?.size || "-1"), 10)
    return { primaryUrl, fileSize, allUrls: [primaryUrl] }
  }

  const emulatorExt = json.metadata?.emulator_ext ? String(json.metadata.emulator_ext).toLowerCase() : ""
  if (emulatorExt && !emulatorExt.includes("nib")) {
    for (const file of validFiles) {
      if (file.toLowerCase().endsWith(emulatorExt)) {
        const primaryUrl = new URL(`https://archive.org/download/${identifier}${file}`)
        const fileSize = parseInt(String(json.files[file]?.size || "-1"), 10)
        return { primaryUrl, fileSize, allUrls: [primaryUrl] }
      }
    }
  }

  for (const ext of DISK_EXTENSIONS) {
    for (const file of validFiles) {
      if (file.toLowerCase().endsWith(ext)) {
        const primaryUrl = new URL(`https://archive.org/download/${identifier}${file}`)
        const fileSize = parseInt(String(json.files[file]?.size || "-1"), 10)
        return { primaryUrl, fileSize, allUrls: [primaryUrl] }
      }
    }
  }

  return { fileSize: -1 }
}

export const getDiskImageUrlFromIdentifier = async (identifier: string): Promise<[URL | undefined, number, URL[]?]> => {
  const cached = iaResolveCache.get(identifier)
  if (cached && cached.expiresAt > Date.now()) {
    const primaryUrl = cached.resolvedUrl ? new URL(cached.resolvedUrl) : undefined
    const allUrls = cached.allUrls ? cached.allUrls.map(u => new URL(u)) : (primaryUrl ? [primaryUrl] : undefined)
    return [primaryUrl, cached.fileSize, allUrls]
  }

  const existingRequest = iaResolveInflight.get(identifier)
  if (existingRequest) {
    return existingRequest
  }

  const request = (async (): Promise<[URL | undefined, number, URL[]?]> => {
    let newDiskImageUrl: URL | undefined
    let fileSize = -1
    let allDiskImageUrls: URL[] | undefined
    const detailsUrl = `https://archive.org/details/${identifier}?output=json`
    const favicon: Record<string, string> = {}
    favicon[iconKey()] = iconData()

    const processDiskImageResponse = async (response: Response) => {
      if (!response.ok) {
        return
      }

      const json = await response.json()
      if (!(json.metadata && json.files)) {
        return
      }

      const resolved = resolveIaDiskFilesFromDetails(identifier, json)
      if (resolved.primaryUrl) {
        newDiskImageUrl = resolved.primaryUrl
        fileSize = resolved.fileSize
        allDiskImageUrls = resolved.allUrls
      }
    }

    const cloudflareResponse = await fetchCloudflareProxy(detailsUrl)
    if (cloudflareResponse) {
      await processDiskImageResponse(cloudflareResponse)
    }

    // Try a direct fetch first: archive.org sends permissive CORS headers, so
    // this succeeds in the browser and avoids depending on the CORS proxies.
    // Only fall back to the proxies if the direct request fails. The resolve
    // result is cached (positive and negative) below, so this doesn't hammer
    // Internet Archive with repeated requests.
    try {
      if (!newDiskImageUrl) {
        const response = await fetch(detailsUrl)
        await processDiskImageResponse(response)
      }
    } catch {
      // Direct fetch failed (likely CORS); fall back to the proxies below.
    }

    if (!newDiskImageUrl) {
      const domain = getProxyTargetDomain(detailsUrl)
      const proxyCandidates = sortProxyCandidatesForDomain(domain, getCorsProxyCandidates(detailsUrl))
      for (const candidate of proxyCandidates) {
        try {
          const response = await fetch(candidate.url)
          await processDiskImageResponse(response)
          if (newDiskImageUrl) {
            noteProxyScore(domain, candidate.id, true)
            break
          }
          noteProxyScore(domain, candidate.id, response.ok)
        } catch {
          noteProxyScore(domain, candidate.id, false)
          // Continue to next proxy candidate.
        }
      }
    }

    if (!newDiskImageUrl) {
      try {
        const response = await fetch(iconName() + detailsUrl, { headers: favicon })
        await processDiskImageResponse(response)
      } catch {
        // We cache failure below to avoid repeated hammering when a provider is down.
      }
    }

    iaResolveCache.set(identifier, {
      resolvedUrl: newDiskImageUrl ? newDiskImageUrl.toString() : "",
      fileSize,
      allUrls: allDiskImageUrls ? allDiskImageUrls.map(u => u.toString()) : undefined,
      expiresAt: Date.now() + (newDiskImageUrl ? IA_CACHE_TTL_MS : IA_NEGATIVE_CACHE_TTL_MS)
    })

    if (!newDiskImageUrl) {
      console.warn(`Unable to resolve Internet Archive disk image for ${detailsUrl}`)
    }

    return [newDiskImageUrl, fileSize, allDiskImageUrls]
  })().finally(() => {
    iaResolveInflight.delete(identifier)
  })

  iaResolveInflight.set(identifier, request)
  return request
}
