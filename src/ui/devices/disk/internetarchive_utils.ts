import { iconKey, iconData, iconName } from "../../img/iconfunctions"

export const internetArchiveUrlProtocol = "a2ia://"

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
      if (!(json.metadata && json.metadata.emulator_ext && json.files)) {
        return
      }

      const emulatorExt = json.metadata.emulator_ext.toString().toLowerCase()
      for (const file of Object.keys(json.files)) {
        if (file.toLowerCase().endsWith(emulatorExt)) {
          newDiskImageUrl = new URL(`https://archive.org/download/${identifier}${file}`)
          fileSize = parseInt(json.files[file].size)
          return
        }
      }
    }

    const canUseDirectFetch = typeof window !== "undefined" && "electronAPI" in window

    try {
      if (canUseDirectFetch) {
        const response = await fetch(detailsUrl)
        await processDiskImageResponse(response)
      }

      if (!newDiskImageUrl) {
        const response = await fetch("https://proxy.corsfix.com/?" + detailsUrl,
          { headers: { "x-corsfix-cache": "true" } })
        await processDiskImageResponse(response)
      }

      if (!newDiskImageUrl) {
        const response = await fetch(iconName() + detailsUrl, { headers: favicon })
        await processDiskImageResponse(response)
      }
    } catch {
      // We cache failure below to avoid repeated hammering when a provider is down.
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
