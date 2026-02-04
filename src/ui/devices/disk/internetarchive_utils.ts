import { iconKey, iconData, iconName } from "../../img/iconfunctions"
import { showGlobalProgressModal } from "../../ui_utilities"

export const internetArchiveUrlProtocol = "a2ia://"

export const generateUrlFromInternetArchiveId = (identifier: string): URL => {
  return new URL(internetArchiveUrlProtocol + identifier)
}

export const getDiskImageUrlFromIdentifier = async (identifier: string) => {
  let newDiskImageUrl: URL | undefined
  const detailsUrl = `https://archive.org/details/${identifier}?output=json`
  const favicon: { [key: string]: string } = {}
  favicon[iconKey()] = iconData()
  
  const processDiskImageResponse = async (response: Response) => {
    if (response.ok) {
      const json = await response.json()
      if (json.metadata && json.metadata.emulator_ext && json.files) {
        const emulatorExt = json.metadata.emulator_ext.toString().toLowerCase()

        Object.keys(json.files).forEach((file) => {
          if (file.toLowerCase().endsWith(emulatorExt)) {
            newDiskImageUrl = new URL(`https://archive.org/download/${identifier}${file}`)
            console.log(`Found disk image ${newDiskImageUrl.toString}`)
            return
          }
        })
      } else {
        console.warn(`getDiskImageUrlFromIdentifier ${detailsUrl}: disk image not found`)
      }
    } else {
      console.warn(`getDiskImageUrlFromIdentifier ${detailsUrl}: ${response.statusText}`)
    }
  }
  
  showGlobalProgressModal(true)
  try {
    // Try direct fetch first (works in Electron)
    const response = await fetch(detailsUrl)
    await processDiskImageResponse(response)
  } catch {
    try {
      console.log("Direct fetch failed, trying with corsfix")
      const response = await fetch("https://proxy.corsfix.com/?" + detailsUrl)
      await processDiskImageResponse(response)
    } catch {
      console.log("Direct fetch failed, trying with CORS proxy")
      const response = await fetch(iconName() + detailsUrl, { headers: favicon })
      await processDiskImageResponse(response)
    }
  } finally {
    showGlobalProgressModal(false)
  }

  return newDiskImageUrl
}
