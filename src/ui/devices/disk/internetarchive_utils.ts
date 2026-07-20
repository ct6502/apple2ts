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
    { id: "corsproxy-encoded", url: "https://corsproxy.io/?" + encodedUrl },
    { id: "corsfix-encoded", url: "https://proxy.corsfix.com/?" + encodedUrl },
  ]
}

const iaResolveCache = new Map<string, {
  resolvedUrl: string,
  fileSize: number,
  expiresAt: number
}>()
const iaResolveInflight = new Map<string, Promise<[URL | undefined, number]>>()

const IA_CACHE_TTL_MS = 30 * 60 * 1000
const IA_NEGATIVE_CACHE_TTL_MS = 2 * 60 * 1000

export const generateUrlFromInternetArchiveId = (identifier: string): URL => {
  return new URL(internetArchiveUrlProtocol + identifier)
}

export const clearIaResolveCache = (identifier: string) => {
  iaResolveCache.delete(identifier)
}

export const getDiskImageUrlFromIdentifier = async (identifier: string): Promise<[URL | undefined, number]> => {
  const cached = iaResolveCache.get(identifier)
  if (cached && cached.expiresAt > Date.now()) {
    return [cached.resolvedUrl ? new URL(cached.resolvedUrl) : undefined, cached.fileSize]
  }

  const existingRequest = iaResolveInflight.get(identifier)
  if (existingRequest) {
    return existingRequest
  }

  const request = (async (): Promise<[URL | undefined, number]> => {
    let newDiskImageUrl: URL | undefined
    let fileSize = -1
    const detailsUrl = `https://archive.org/details/${identifier}?output=json`
    const favicon: { [key: string]: string } = {}
    favicon[iconKey()] = iconData()

    const processDiskImageResponse = async (response: Response) => {
      if (!response.ok) {
        return
      }

      const json = await response.json()
      if (!(json.metadata && json.files)) {
        return
      }

      const emulatorExt = json.metadata.emulator_ext
        ? json.metadata.emulator_ext.toString().toLowerCase()
        : ""

      if (emulatorExt) {
        for (const file of Object.keys(json.files)) {
          if (file.toLowerCase().endsWith(emulatorExt)) {
            newDiskImageUrl = new URL(`https://archive.org/download/${identifier}${file}`)
            fileSize = parseInt(json.files[file].size)
            return
          }
        }
      }

      // Fallback: emulator_ext missing or no matching file found. Scan for
      // known disk image extensions (prefer .woz, then common formats).
      const knownExts = [".woz", ".dsk", ".po", ".hdv", ".2mg", ".nib", ".do"]
      for (const ext of knownExts) {
        for (const file of Object.keys(json.files)) {
          if (file.toLowerCase().endsWith(ext)) {
            newDiskImageUrl = new URL(`https://archive.org/download/${identifier}${file}`)
            fileSize = parseInt(json.files[file].size)
            return
          }
        }
      }
    }

    // Try a direct fetch first: archive.org sends permissive CORS headers, so
    // this succeeds in the browser and avoids depending on the CORS proxies.
    // Only fall back to the proxies if the direct request fails. The resolve
    // result is cached (positive and negative) below, so this doesn't hammer
    // Internet Archive with repeated requests.
    try {
      const response = await fetch(detailsUrl)
      await processDiskImageResponse(response)
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
      expiresAt: Date.now() + (newDiskImageUrl ? IA_CACHE_TTL_MS : IA_NEGATIVE_CACHE_TTL_MS)
    })

    if (!newDiskImageUrl) {
      console.warn(`Unable to resolve Internet Archive disk image for ${detailsUrl}`)
    }

    return [newDiskImageUrl, fileSize]
  })().finally(() => {
    iaResolveInflight.delete(identifier)
  })

  iaResolveInflight.set(identifier, request)
  return request
}
