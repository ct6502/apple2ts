import type { RetroControlMetadata } from "../../retro/retromenucontext"
import { createRetroCloudDriveControl } from "./clouddrive_retro"
import { loadDiskFromCloudDrive } from "./diskdrive"
import { GoogleDrive } from "./googledrive"

export const createRetroGoogleDriveControl = (driveIndex: number): RetroControlMetadata => {
  const googleDrive = new GoogleDrive()
  const control = createRetroCloudDriveControl(driveIndex, {
    id: `diskDrives.${driveIndex}.load.googleDrive`,
    displayName: "Google Drive",
    hasAuthToken: () => googleDrive.hasAuthToken(),
    signIn: () => googleDrive.signIn(),
    listFolder: folderId => googleDrive.listFolder(folderId),
    loadFile: (item, targetDriveIndex) =>
      loadDiskFromCloudDrive(new GoogleDrive(item), targetDriveIndex),
  })
  control.label = context => context.t("disk.loadDiskFromGoogleDrive")
  return control
}