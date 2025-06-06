import { getBlobFromDiskData } from "./diskdrive"
import { diskImages } from "./diskimages"
import * as fflate from "fflate"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import { isHardDriveImage, RUN_MODE, FILE_SUFFIXES, MAX_DRIVES, replaceSuffix } from "../../../common/utility"
import { iconKey, iconData, iconName } from "../../img/iconfunctions"
import { passSetDriveNewData, passSetDriveProps, passSetBinaryBlock, passPasteText, handleGetRunMode, passSetRunMode } from "../../main2worker"
import { DISK_COLLECTION_ITEM_TYPE } from "../../panels/diskcollectionpanel"
import { showGlobalProgressModal } from "../../ui_utilities"
import { internetArchiveUrlProtocol, getDiskImageUrlFromIdentifier } from "./internetarchive_utils"
import { newReleases } from "./newreleases"
import { DiskBookmarks } from "./diskbookmarks"
import { parseGameList } from "./totalreplayutilities"

// Technically, all of these properties should be in the main2worker.ts file,
// since they just maintain the state that needs to be passed to/from the
// emulator. But the helper functions were getting too large, so now it's here.

const initDriveProps = (index: number, drive: number, hardDrive: boolean): DriveProps => {
  return {
    index: index,
    hardDrive: hardDrive,
    drive: drive,
    filename: "",
    status: "",
    diskHasChanges: false,
    isWriteProtected: false,
    motorRunning: false,
    diskData: new Uint8Array(),
    lastWriteTime: -1,
    cloudData: null,
    writableFileHandle: null,
    lastLocalWriteTime: -1
  }
}

const driveProps: DriveProps[] = [initDriveProps(0, 1, true), initDriveProps(1, 2, true),
  initDriveProps(2, 1, false), initDriveProps(3, 2, false)]

export const handleGetFilename = (index: number) => {
  let f = driveProps[index].filename
  if (f !== "") {
    const i = f.lastIndexOf(".")
    if (i > 0) {
      f = f.substring(0, i)
    }
    return f
  }
  return null
}

export const doSetUIDriveProps = (props: DriveProps) => {
  // For efficiency we only receive disk data if it has changed.
  // If our disk is the same but it hasn't changed, keep the existing data.
  if (props.diskData.length === 0) {
    const tmp = driveProps[props.index].diskData
    const diskHasChanges = driveProps[props.index].diskHasChanges
    driveProps[props.index] = props
    driveProps[props.index].diskData = tmp
    driveProps[props.index].diskHasChanges = diskHasChanges
  } else {
    driveProps[props.index] = props
  }
}

export const handleGetDriveProps = (index: number) => {
  return driveProps[index]
}

export const handleSetDiskData = (
  index: number,
  data: Uint8Array,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: FileSystemFileHandle | null,
  lastLocalWriteTime: number) => {
  if (cloudData) {
    cloudData.fileSize = data.length
  }
  driveProps[index].filename = filename
  driveProps[index].diskData = data
  driveProps[index].lastLocalWriteTime = lastLocalWriteTime
  driveProps[index].cloudData = cloudData
  driveProps[index].writableFileHandle = writableFileHandle
  passSetDriveNewData(driveProps[index])
}

export const handleSetDiskWriteProtected = (index: number, isWriteProtected: boolean) => {
  driveProps[index].isWriteProtected = isWriteProtected
  passSetDriveProps(driveProps[index])
}

const findMatchingDiskImage = (url: string) => {
  const name = decodeURIComponent(url).replace(/[^A-Z]/gi, "").toUpperCase()
  for (let i = 0; i < diskImages.length; i++) {
    const diskname = diskImages[i].title.replace(/[^A-Z]/gi, "").toUpperCase()
    if (diskname.includes(name)) {
      return diskImages[i]
    }
  }
  for (let i = 0; i < newReleases.length; i++) {
    const diskname = newReleases[i].title.replace(/[^A-Z]/gi, "").toUpperCase()
    if (diskname.includes(name)) {
      return newReleases[i]
    }
  }
  // If we don't find a disk image in our pre-defined list, just assume
  // that they've given an exact filename in our public folder.
  return {
    type: DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE,
    title: "",
    lastUpdated: new Date(0),
    diskUrl: url,
    } as DiskCollectionItem
}

let binaryRunAddress = 0x300
export const setDefaultBinaryAddress = (address: number) => {
  binaryRunAddress = address
}

export const handleSetDiskOrFileFromBuffer = (
  index: number,
  buffer: ArrayBuffer,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: FileSystemFileHandle | null) => {
  const fname = filename.toLowerCase()
  let newIndex = index

  if (fname.endsWith(".bin")) {
    passSetBinaryBlock(binaryRunAddress, new Uint8Array(buffer), true)
  } else if (fname.endsWith(".bas") || fname.endsWith(".a")) {
    const decoder = new TextDecoder("utf-8")
    const basic = decoder.decode(buffer)
    if (basic !== "") {
      const trimmed = basic.trim()
      const hasLineNumbers = /^[0-9]/.test(trimmed) || /[\n\r][0-9]/.test(trimmed)
      const cmd = hasLineNumbers ? "\nRUN\n" : "\n"
      passPasteText(basic + cmd)
    }
  } else {
    // Force hard drive images to be in "0" or "1" (slot 7 drive 1 or 2)
    if (isHardDriveImage(fname)) {
      if (index < 0 || index > 1) newIndex = 0
    } else {
      if (index < 2) newIndex = 2
    }
    handleSetDiskData(newIndex, new Uint8Array(buffer), filename, cloudData, writableFileHandle, Date.now())
    if (handleGetRunMode() === RUN_MODE.IDLE) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
    } else {
//      props.updateDisplay()
    }
  }

  return newIndex
}

export const handleSetDiskFromCloudData = async (
  cloudData: CloudData,
  driveIndex: number = 0,
  callback?: (buffer: ArrayBuffer | null) => void) => {
  let cloudProvider
  switch (cloudData.providerName) {
    case "GoogleDrive":
      cloudProvider = new GoogleDrive
      break

    case "OneDrive":
      cloudProvider = new OneDriveCloudDrive
      break
  }

  if (cloudProvider) {
    cloudProvider.requestAuthToken(async (authToken: string) => {
      if (!callback) {
        showGlobalProgressModal(true, "Downloading disk")
      }

      const response = await fetch(cloudData.downloadUrl, {
        headers: {
          "Authorization": authToken,
          "Content-Type": "application/octet"
        },
        redirect: "follow"
      })
        .finally(() => {
          if (!callback) {
            showGlobalProgressModal(false)
          }
        })

      if (response.ok) {
        const blob = await response.blob()
        const buffer = await new Response(blob).arrayBuffer()

        if (callback) {
          callback(buffer)
        } else {
          cloudData.lastSyncTime = Date.now()
          handleSetDiskOrFileFromBuffer(driveIndex, buffer, cloudData.fileName, cloudData, null)
        }
      } else {
        if (callback) {
          callback(null)
        } else {
          // $TODO: Add error handling
        }
      }
    })
  }
}

export const handleSetDiskFromURL = async (url: string,
  updateDisplay?: UpdateDisplay, index = 0, cloudData?: CloudData,
  callback?: (buffer: ArrayBuffer | null) => void) => {
  if (!url.startsWith("http") && updateDisplay) {
    const match = findMatchingDiskImage(url)
    if ( !match.diskUrl ) {
      return
    }
    url = match.diskUrl.toString()
    if (!URL.canParse(url)) {
      handleSetDiskFromFile(url, updateDisplay, index)
      return
    }
  }

  // Resolve Internet Archive URL, if necessary
  if (url.startsWith(internetArchiveUrlProtocol)) {
    const identifier = url.substring(internetArchiveUrlProtocol.length)
    const [resolvedUrl, fileSize] = await getDiskImageUrlFromIdentifier(identifier)

    if (resolvedUrl) {
      url = resolvedUrl.toString()

      const diskBookmarks = new DiskBookmarks()
      const bookmark = diskBookmarks.get(identifier)
      if (bookmark) {
        bookmark.diskUrl = resolvedUrl
        if (bookmark.cloudData) {
          bookmark.cloudData.fileSize = fileSize
        }
        diskBookmarks.set(bookmark)
      }
    }
  }

  // Download the file from the fragment URL
  try {
    let name = ""
    let buffer

    // Ask CT6502 for why we need to use this favicon header
    const favicon: { [key: string]: string } = {}
    favicon[iconKey()] = iconData()

    if (!callback) {
      showGlobalProgressModal(true, "Downloading disk")
    }

    const response = await fetch(iconName() + url, { headers: favicon })
      .finally(() => {
        if (!callback) {
          showGlobalProgressModal(false)
        }
      })

    if (!response.ok) {
      console.error(`HTTP error: status ${response.status}`)
      if (callback) {
        callback(null)
      } else {
        return
      }
    }

    const blob = await response.blob()

    if (url.toLowerCase().endsWith(".zip")) {
      const unzipper = new fflate.Unzip()
      unzipper.register(fflate.UnzipInflate)

      unzipper.onfile = file => {
        const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLocaleLowerCase()
        if (FILE_SUFFIXES.includes(fileExtension)) {
          file.ondata = (_err, data) => {
            // Ignore index files, etc.
            if (data.length > 1024) {
              name = file.name
              buffer = data
              return
            }
          }
          file.start()
          return
        }
      }
      const zipBuffer = await new Response(blob).arrayBuffer()
      unzipper.push(new Uint8Array(zipBuffer), true)
    } else {
      const urlObj = new URL(url)
      name = url
      const hasSlash = urlObj.pathname.lastIndexOf("/")
      if (hasSlash >= 0) {
        name = urlObj.pathname.substring(hasSlash + 1)
      }

      buffer = await new Response(blob).arrayBuffer()
    }

    if (buffer) {
      if (callback) {
        callback(buffer)
      } else {
        handleSetDiskOrFileFromBuffer(index, buffer, name, cloudData || null, null)
      }
    } else {
      if (callback) {
        callback(null)
      } else {
        // $TODO: Add error handling
      }
    }
  } catch {
    console.error(`Error fetching URL: ${url}`)
    if (callback) {
        callback(null)
    }
  }
}

const resetAllDiskDrives = () => {
  for (let i=0; i < MAX_DRIVES; i++) {
    handleSetDiskData(i, new Uint8Array(), "", null, null, -1)
  }
}

export const handleSetDiskFromFile = async (disk: string,
  updateDisplay: UpdateDisplay, driveIndex: number = -1,
  callback?: (buffer: ArrayBuffer | null) => void) => {
  let data: ArrayBuffer
  try {
    const res = await fetch("/disks/" + disk)
    data = await res.arrayBuffer()
  } catch {
    if (callback) {
      callback(null)
    } else {
      // $TODO: Add error handling
    }
    return
  }

  if (callback) {
    callback(data)
  } else {
    let needsBoot = false
    
    if (driveIndex < 0) {
      needsBoot = true
      driveIndex = 0
    }
    
    if (needsBoot) {
      resetAllDiskDrives()
      driveIndex = 0
    }

    handleSetDiskData(driveIndex, new Uint8Array(data), disk, null, null, -1)

    if (needsBoot) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
    }

    const helpFile = replaceSuffix(disk, "txt")
    try {
      const help = await fetch("/disks/" + helpFile, { credentials: "include", redirect: "error" })
      let helptext = "<Default>"
      if (help.ok) {
        helptext = await help.text()
        // Hack: when running on localhost, if the file is missing it just
        // returns the index.html. So just return an empty string instead.
        if (helptext.startsWith("<!DOCTYPE html>")) {
          helptext = "<Default>"
        }
        if (helpFile.includes("Total%20Replay")) {
        helptext = parseGameList(helptext)
      }
      updateDisplay(0, helptext)
      }      
    } catch {
      // If we don't have a help text file, just revert to the default text.
      updateDisplay(0, "<Default>")
    }
  }
}

export const handleSaveWritableFile = async (index: number, writableFileHandle: FileSystemFileHandle|null = null) => {
  let success = false

  if (writableFileHandle === null) {
    writableFileHandle = driveProps[index].writableFileHandle
  }

  if (writableFileHandle) {
    try {
      const dprops = driveProps[index]
      const blob = getBlobFromDiskData(dprops.diskData, dprops.filename)
      const writable = await writableFileHandle.createWritable()

      await writable.write(blob)
      await writable.close()
      
      success = true
    } catch (ex) {
      console.log(`Error saving writable file: ${ex}`)
    }
  }

  return success
}