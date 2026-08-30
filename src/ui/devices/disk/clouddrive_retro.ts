import { FILE_SUFFIXES_DISK } from "../../../common/utility"
import { RETRO_SKIN } from "../../localstorage"
import type { RetroControlMetadata, RetroMenuContext } from "../../retro/retromenucontext"
import { controlFromJson, type RetroControlBindings } from "../../retro/retrocontrolmetadata"
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
  loadLabelKey: string
  template?: RetroControlMetadata
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

const cloudDriveTemplateBindings: RetroControlBindings = {
  "diskDrives.cloudDrive.parentItem": { label: (): string => ".." },
  "diskDrives.cloudDrive.folder": { label: (): string => "" },
  "diskDrives.cloudDrive.file": { label: (): string => "" },
}

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

  const loadCurrentFolder = async (context: RetroMenuContext) => {
    const folder = state.folders.at(-1)!
    showGlobalProgressModal(true, context.t("messages.fetchingCloudData"))
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
      const parentBase = controlFromJson("diskTemplates", "diskDrives.cloudDrive.parentItem", cloudDriveTemplateBindings)
      controls.push({
        ...parentBase,
        id: `${provider.id}.parent`,
        action: async runtime => {
          state.folders.pop()
          await loadCurrentFolder(runtime)
        },
      })
    }

    const visibleItems = state.items
      .filter(item => item.kind === "folder" || isDiskFile(item.name))
      .sort((left, right) => Number(right.kind === "folder") - Number(left.kind === "folder") ||
        left.name.localeCompare(right.name))

    const folderBase = controlFromJson("diskTemplates", "diskDrives.cloudDrive.folder", cloudDriveTemplateBindings)
    const fileBase = controlFromJson("diskTemplates", "diskDrives.cloudDrive.file", cloudDriveTemplateBindings)
    controls.push(...visibleItems.map((item): RetroControlMetadata => item.kind === "folder"
      ? {
        ...folderBase,
        id: `${provider.id}.folder.${item.id}`,
        label: folderLabel(context, item.name),
        action: async runtime => {
          state.folders.push({ id: item.id, name: item.name })
          await loadCurrentFolder(runtime)
        },
      }
      : {
        ...fileBase,
        id: `${provider.id}.file.${item.id}`,
        label: item.name,
        action: async runtime => {
          showGlobalProgressModal(true, runtime.t("messages.fetchingCloudData"))
          try {
            if (await provider.loadFile(item, driveIndex)) runtime.close()
          } finally {
            showGlobalProgressModal(false)
          }
        },
      }))
    return controls
  }

  return {
    ...provider.template,
    id: provider.id,
    label: provider.template?.label ?? (context => context.t(provider.loadLabelKey)),
    submenuTitle: provider.template?.submenuTitle ?? provider.displayName,
    actionLabel: provider.template?.actionLabel ?? (context => context.t("retroControl.open")),
    afterOpen: async context => {
      if (!provider.hasAuthToken() && !await provider.signIn()) return
      if (!state.loaded) await loadCurrentFolder(context)
    },
    dynamicChildren: context => buildItems(context),
  }
}