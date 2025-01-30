import { FILE_SUFFIXES } from "../../emulator/utility/utility";

const applicationId = "74fef3d4-4cf3-4de9-b2d7-ef63f9add409"

export const showOneDriveFilePicker = async () => {
  launchOneDrivePicker().then(result => {
    if (result) {
        for (const file of result.value) {
            const name = file.name
            const url = file["@content.downloadUrl"]
            console.log({ name: name, url: url })

            fetch(url)
                .then(response => {
                    return response.blob()
                }).then(blob => {
                    const url = URL.createObjectURL(blob);
                    (<HTMLImageElement>document.getElementById("preview")).src = url
                })
        }
    }
  }).catch(reason => {
      console.error(reason)
  })
}

function launchOneDrivePicker() {
  return new Promise<OneDriveResult | null>((resolve, reject) => {
      var odOptions: OneDriveOpenOptions = {
          clientId: applicationId,
          action: "share",
          multiSelect: false,
          openInNewWindow: true,
          advanced: {
              filter: FILE_SUFFIXES,
              endpointHint: "api.onedrive.com",
              isConsumerAccount: true
          },
          success: function (files) { resolve(files) },
          cancel: function () { resolve(null) },
          error: function (e) { reject(e) }
      }

      OneDrive.open(odOptions)
  })
}

interface OneDriveResult {
  value: OneDriveFile[]
  webUrl: string | null
}

interface OneDriveFile {
  "@content.downloadUrl": string
  "thumbnails@odata.context": string
  id: string
  name: string
  size: number
  thumbnails: Thumbnails[]
  webUrl: string
}

interface Thumbnails {
  id: string
  large: Thumbnail
  medium: Thumbnail
  small: Thumbnail
}

interface Thumbnail {
  height: number
  width: number
  url: string
}

interface OneDriveOpenOptions {
  clientId: string
  action: "download" | "share" | "query"
  multiSelect: boolean
  openInNewWindow: boolean
  advanced: {
      filter: string
      endpointHint?: string
      isConsumerAccount?: boolean
      redirectUri?: string
  }
  success(result: OneDriveResult): void
  cancel(): void
  error(e: any): void
}

interface OneDrive {
  open(options: OneDriveOpenOptions): any
}

declare var OneDrive: OneDrive