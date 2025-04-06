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
  
  showGlobalProgressModal(true, "Fetching disk metadata")
  await fetch(iconName() + detailsUrl, { headers: favicon })
    .then(async response => {
      if (response.ok) {
        const json = await response.json()
        if (json.metadata && json.metadata.emulator_ext && json.files) {
          const emulatorExt = json.metadata.emulator_ext.toString().toLowerCase()

          Object.keys(json.files).forEach((file) => {
            if (file.toLowerCase().endsWith(emulatorExt)) {
              newDiskImageUrl = new URL(`https://archive.org/download/${identifier}${file}`)
              return
            }
          })
        } else {
          console.warn(`${detailsUrl}: disk image not found`)
          return undefined
        }
      } else {
        console.warn(`${detailsUrl}: ${response.statusText}`)
        return undefined
      }
    })
    .finally(() => {
      showGlobalProgressModal(false)
    })

  return newDiskImageUrl
}
