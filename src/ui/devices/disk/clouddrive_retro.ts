import { FILE_SUFFIXES_DISK } from "../../../common/utility"
import { RETRO_SKIN } from "../../localstorage"
import type { RetroControlMetadata, RetroMenuContext } from "../../retro/retromenucontext"
import { showGlobalProgressModal } from "../../ui_utilities"

export type CloudBrowserItem = {
  id: string
  name: string
  kind: "folder" | "file"
  size?: number
  parentId?: string
  downloadUrl?: string
  webUrl?: string
}

export type CloudBrowserProvider = {
  id: string
  displayName: string
  hasAuthToken: () => boolean
  signIn: () => Promise<boolean>
  listFolder: (folderId: string) => Promise<CloudBrowserItem[]>
  loadFile: (item: CloudBrowserItem, driveIndex: number) => Promise<boolean>
}

type FolderLocation = {
  id: string
  name: string
}

type CloudBrowserState = {
  folders: FolderLocation[]
  items: CloudBrowserItem[]
  loaded: boolean
}

const diskExtensions = FILE_SUFFIXES_DISK.split(",")

const isDiskFile = (name: string) => {
  const lowerName = name.toLowerCase()
  return diskExtensions.some(extension => lowerName.endsWith(extension))
}

const folderLabel = (context: RetroMenuContext, name: string) =>
  `${context.retroSkin === RETRO_SKIN.APPLE_IIPLUS
    ? "[]"
    : `${String.fromCodePoint(0xe098)}${String.fromCodePoint(0xe099)}`} ${name}`

export const createRetroCloudDriveControl = (
  driveIndex: number,
  provider: CloudBrowserProvider,
): RetroControlMetadata => {
  const state: CloudBrowserState = {
    folders: [{ id: "root", name: provider.displayName }],
    items: [],
    loaded: false,
  }

  const loadCurrentFolder = async () => {
    const folder = state.folders.at(-1)!
    showGlobalProgressModal(true, "Fetching cloud data")
    try {
      state.items = await provider.listFolder(folder.id)
      state.loaded = true
    } finally {
      showGlobalProgressModal(false)
    }
  }

  const buildItems = (context: RetroMenuContext): RetroControlMetadata[] => {
    const controls: RetroControlMetadata[] = []
    if (state.folders.length > 1) {
      controls.push({
        id: `${provider.id}.parent`,
        label: "..",
        contextualActionLabel: "Open",
        keepMenuOpen: true,
        refreshAfterAction: true,
        action: async () => {
          state.folders.pop()
          await loadCurrentFolder()
        },
      })
    }

    const visibleItems = state.items
      .filter(item => item.kind === "folder" || isDiskFile(item.name))
      .sort((left, right) => Number(right.kind === "folder") - Number(left.kind === "folder") ||
        left.name.localeCompare(right.name))

    controls.push(...visibleItems.map((item): RetroControlMetadata => ({
      id: `${provider.id}.${item.kind}.${item.id}`,
      label: item.kind === "folder" ? folderLabel(context, item.name) : item.name,
      useRetroFont: item.kind === "folder",
      contextualActionLabel: item.kind === "folder" ? "Open" : "Load",
      keepMenuOpen: true,
      refreshAfterAction: item.kind === "folder",
      action: item.kind === "folder"
        ? async () => {
          state.folders.push({ id: item.id, name: item.name })
          await loadCurrentFolder()
        }
        : async runtime => {
          showGlobalProgressModal(true, "Fetching cloud data")
          try {
            if (await provider.loadFile(item, driveIndex)) runtime.close()
          } finally {
            showGlobalProgressModal(false)
          }
        },
    })))
    return controls
  }

  return {
    id: provider.id,
    label: `Load Disk from ${provider.displayName}`,
    submenuTitle: provider.displayName,
    actionLabel: "Open",
    afterOpen: async () => {
      if (!provider.hasAuthToken() && !await provider.signIn()) return
      if (!state.loaded) await loadCurrentFolder()
    },
    dynamicChildren: context => buildItems(context),
  }
}