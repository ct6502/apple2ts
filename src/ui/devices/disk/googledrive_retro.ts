import type { RetroControlMetadata } from "../../retro/retromenucontext"
import { createRetroCloudDriveControl } from "./clouddrive_retro"
import { loadDiskFromCloudDrive } from "./diskdrive"
import { GoogleDrive } from "./googledrive"
import { controlFromJson } from "../../retro/retrocontrolmetadata"

export const createRetroGoogleDriveControl = (driveIndex: number): RetroControlMetadata => {
  const template = controlFromJson(
    "diskTemplates",
    "diskDrives.{{driveIndex}}.load.googleDrive",
    {},
    { driveIndex },
  ) as RetroControlMetadata & { providerName?: string }
  const googleDrive = new GoogleDrive()
  return createRetroCloudDriveControl(driveIndex, {
    id: template.id,
    displayName: template.providerName ?? "Google Drive",
    loadLabelKey: "disk.loadDiskFromGoogleDrive",
    hasAuthToken: () => googleDrive.hasAuthToken(),
    signIn: () => googleDrive.signIn(),
    listFolder: folderId => googleDrive.listFolder(folderId),
    loadFile: (item, targetDriveIndex) =>
      loadDiskFromCloudDrive(new GoogleDrive(item), targetDriveIndex),
    template,
  })
}