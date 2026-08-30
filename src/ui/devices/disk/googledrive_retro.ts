import type { RetroControlMetadata } from "../../retro/retromenucontext"
import { loadDiskFromCloudDrive } from "./diskdrive"
import { GoogleDrive } from "./googledrive"

export const createRetroGoogleDriveControl = (driveIndex: number): RetroControlMetadata => ({
    id: `diskDrives.${driveIndex}.load.googleDrive`,
    label: context => context.t("disk.loadDiskFromGoogleDrive"),
    actionLabel: context => context.t("retroControl.load"),
    action: async context => {
      if (await loadDiskFromCloudDrive(new GoogleDrive(), driveIndex)) context.close()
    },
  })