import type { RetroControlMetadata } from "../../retro/retromenucontext"
import { createRetroCloudDriveControl } from "./clouddrive_retro"
import { loadDiskFromCloudDrive } from "./diskdrive"
import { OneDriveCloudDrive } from "./onedriveclouddrive"

export const createRetroOneDriveControl = (driveIndex: number): RetroControlMetadata => {
  const oneDrive = new OneDriveCloudDrive()
  const control = createRetroCloudDriveControl(driveIndex, {
    id: `diskDrives.${driveIndex}.load.oneDrive`,
    displayName: "OneDrive",
    loadLabelKey: "disk.loadDiskFromOneDrive",
    hasAuthToken: () => oneDrive.hasAuthToken(),
    signIn: () => oneDrive.signIn(),
    listFolder: folderId => oneDrive.listFolder(folderId),
    loadFile: (item, targetDriveIndex) =>
      loadDiskFromCloudDrive(new OneDriveCloudDrive(item), targetDriveIndex),
  })
  return control
}