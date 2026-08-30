import type { RetroControlMetadata } from "../../retro/retromenucontext"
import { createRetroCloudDriveControl } from "./clouddrive_retro"
import { loadDiskFromCloudDrive } from "./diskdrive"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { controlFromJson } from "../../retro/retrocontrolmetadata"

export const createRetroOneDriveControl = (driveIndex: number): RetroControlMetadata => {
  const template = controlFromJson(
    "diskTemplates",
    "diskDrives.{{driveIndex}}.load.oneDrive",
    {},
    { driveIndex },
  ) as RetroControlMetadata & { providerName?: string }
  const oneDrive = new OneDriveCloudDrive()
  return createRetroCloudDriveControl(driveIndex, {
    id: template.id,
    displayName: template.providerName ?? "OneDrive",
    loadLabelKey: "disk.loadDiskFromOneDrive",
    hasAuthToken: () => oneDrive.hasAuthToken(),
    signIn: () => oneDrive.signIn(),
    listFolder: folderId => oneDrive.listFolder(folderId),
    loadFile: (item, targetDriveIndex) =>
      loadDiskFromCloudDrive(new OneDriveCloudDrive(item), targetDriveIndex),
    template,
  })
}