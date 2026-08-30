import type { RetroControlMetadata } from "../../retro/retromenucontext"
import { loadDiskFromCloudDrive } from "./diskdrive"
import { GoogleDrive } from "./googledrive"
import { controlFromJson } from "../../retro/retrocontrolmetadata"

export const createRetroGoogleDriveControl = (driveIndex: number): RetroControlMetadata => ({
  ...controlFromJson(
    "diskTemplates",
    "diskDrives.{{driveIndex}}.load.googleDrive",
    {},
    { driveIndex },
  ),
  action: async context => {
    if (await loadDiskFromCloudDrive(new GoogleDrive(), driveIndex)) context.close()
  },
})
