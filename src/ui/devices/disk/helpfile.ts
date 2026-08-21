import { diskImages, internalDiskResources } from "./diskimages"
import { newReleases } from "./newreleases"

export const findCatalogHelpFile = (diskUrl: string) => {
  const catalogDiskUrl = diskUrl.replace(/^\/disks\//, "")
  return [...diskImages, ...newReleases, ...internalDiskResources]
    .find((item) => item.diskUrl === catalogDiskUrl)?.helpFile
}

export const createHelpTextSelector = (loadHelpText: (helpFile: string) => Promise<string>) => {
  let selection = 0

  return (helpFile: string | undefined, applyHelpText: (helpText: string) => void) => {
    const currentSelection = ++selection
    if (!helpFile) {
      applyHelpText("<Default>")
      return
    }
    void loadHelpText(helpFile)
      .catch(() => "<Default>")
      .then((helpText) => {
        if (selection === currentSelection) {
          applyHelpText(helpText)
        }
      })
  }
}
