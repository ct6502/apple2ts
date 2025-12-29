import { getBlobFromDiskData } from "./diskdrive"
import { diskImages } from "./diskimages"
import * as fflate from "fflate"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import { isHardDriveImage, RUN_MODE, MAX_DRIVES, replaceSuffix, FILE_SUFFIXES_DISK } from "../../../common/utility"
import { iconKey, iconData, iconName } from "../../img/iconfunctions"
import { passSetDriveNewData, passSetDriveProps, passSetBinaryBlock, passPasteText, handleGetRunMode, passSetRunMode } from "../../main2worker"
import { DISK_COLLECTION_ITEM_TYPE } from "../../panels/diskcollectionpanel"
import { showGlobalProgressModal } from "../../ui_utilities"
import { internetArchiveUrlProtocol, getDiskImageUrlFromIdentifier } from "./internetarchive_utils"
import { newReleases } from "./newreleases"
import { DiskBookmarks } from "./diskbookmarks"
import { parseGameList } from "./totalreplayutilities"
import { getHotReload } from "../../ui_settings"
import { getDiskImageFromLocalStorage, setDiskImageToLocalStorage } from "../../localstorage"

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
      if (index > 1) newIndex = 0
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

export const handleSetDiskFromCloudData = async (cloudData: CloudData, driveIndex: number = 0) => {
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
      showGlobalProgressModal(true)
      const response = await fetch(cloudData.downloadUrl, {
        headers: {
          "Authorization": authToken,
          "Content-Type": "application/octet"
        },
        redirect: "follow"
      })
        .finally(() => {
          showGlobalProgressModal(false)
        })

      if (response.ok) {
        const blob = await response.blob()
        const buffer = await new Response(blob).arrayBuffer()

        cloudData.lastSyncTime = Date.now()
        handleSetDiskOrFileFromBuffer(driveIndex, buffer, cloudData.fileName, cloudData, null)
      } else {
        // $TODO: Add error handling
      }
    })
  }
}

const fetchWithCorsProxy = async (proxy: string, url: string) => {
  try {
    const response = await fetch(proxy + url)
    return response
  } catch {
    return null
  }
}

const fetchWithCT6502Proxy = async (url: string) => {
  // Ask CT6502 for why we need to use this favicon header
  const favicon: { [key: string]: string } = {}
  favicon[iconKey()] = iconData()
  try {
    const fullURL = iconName() + url
    const response = await fetch(fullURL, { headers: favicon })
    return response
  } catch (error) {
    console.error("CT6502 proxy fetch failed:", error)
    return null
  }
}

let timerId: NodeJS.Timeout|null = null

const diskImageLocalStorageSync = (url: string, index: number) => {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
  timerId = setInterval(() => {
    const dprops = handleGetDriveProps(index)
    if (dprops.diskHasChanges && !dprops.motorRunning) {
      setDiskImageToLocalStorage(index, dprops.diskData)      
      dprops.diskHasChanges = false
      dprops.lastLocalWriteTime = Date.now()
      passSetDriveProps(dprops)
    }
  }, 3 * 1000)
}

export const handleSetDiskFromURL = async (url: string,
  updateDisplay?: UpdateDisplay, index = 0, cloudData?: CloudData) => {
  // Check if it's a local file (not http/https URL)
  const isLocalFile = !url.startsWith("http://") && !url.startsWith("https://")
  
  if (isLocalFile) {
    if (url.startsWith("file://") || url.startsWith("/") || /^[A-Za-z]:/.test(url)) {
      try {
        // Fetch for browser (may fail for local files due to CORS)
        const state = getDiskImageFromLocalStorage()
        if (state) {
          resetAllDiskDrives()
          index = handleSetDiskOrFileFromBuffer(state.index, state.data.buffer, url, null, null)
        } else {
          const response = await fetch(url)
          const buffer = await response.arrayBuffer()
          const fileName = url.split("/").pop() || url        
          resetAllDiskDrives()
          index = handleSetDiskOrFileFromBuffer(index, buffer, fileName, cloudData || null, null)
          setDiskImageToLocalStorage(index, new Uint8Array(buffer))
        }
        diskImageLocalStorageSync(url, index)
        return
      } catch (error) {
        console.error(`Error loading local file: ${url}`, error)
        return
      }
    }
    
    // Otherwise, try to find matching disk image in collections
    const match = findMatchingDiskImage(url)
    if ( !match.diskUrl ) {
      return
    }
    url = match.diskUrl
    if (!URL.canParse(url) && updateDisplay) {
      handleSetDiskFromFile(url, updateDisplay, index)
      return
    }
  }


  // Resolve Internet Archive URL, if necessary
  if (url.startsWith(internetArchiveUrlProtocol)) {
    const identifier = url.substring(internetArchiveUrlProtocol.length)
    const resolvedUrl = await getDiskImageUrlFromIdentifier(identifier)

    if (resolvedUrl) {
      url = resolvedUrl.toString()

      const diskBookmarks = new DiskBookmarks()
      const bookmark = diskBookmarks.get(identifier)
      if (bookmark) {
        bookmark.diskUrl = resolvedUrl.toString()
        diskBookmarks.set(bookmark)
      }
    }
  }

  // Download the file from the fragment URL
  let name = ""
  let buffer

  showGlobalProgressModal(true)

  const corsURL = "https://corsproxy.io/?"
  let response = await fetchWithCorsProxy(corsURL, url)
//  let response = await fetchWithCorsProxy("https://proxy.corsfix.com/?", url)

  console.log("window.crossOriginIsolated:", window.crossOriginIsolated)

  if (response && response.ok) {
    console.log("CORS proxy succeeded: " + corsURL + url)
  } else {
    console.log("First CORS proxy failed, trying next proxy")
    response = await fetchWithCT6502Proxy(url)
    if (!response) {
      showGlobalProgressModal(false)
      console.error(`Error fetching URL: ${url}`)
      return
    }
  }

  showGlobalProgressModal(false)

  try {
    const blob = await response.blob()

    if (url.toLowerCase().endsWith(".zip")) {
      const unzipper = new fflate.Unzip()
      unzipper.register(fflate.UnzipInflate)

      unzipper.onfile = file => {
        const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLocaleLowerCase()
        if (FILE_SUFFIXES_DISK.includes(fileExtension)) {
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
      // If we are loading from a URL, reset all drives. Fixes issue#186
      resetAllDiskDrives()
      handleSetDiskOrFileFromBuffer(index, buffer, name, cloudData || null, null)
    } else {
      // $TODO: Add error handling
    }
  } catch (error) {
    console.error(`Error fetching "${url}": ${error}`)
  }
}

export const prepWritableFile = async (index: number, writableFileHandle: FileSystemFileHandle) => {
  const timer = setInterval(async (index: number) => {
    const dprops = handleGetDriveProps(index)

    if (getHotReload()) {
      const file = await writableFileHandle.getFile()
      if (dprops.lastLocalWriteTime > 0 && file.lastModified > dprops.lastLocalWriteTime) {
        handleSetDiskOrFileFromBuffer(index, await file.arrayBuffer(), file.name, null, writableFileHandle)
        passSetRunMode(RUN_MODE.NEED_BOOT)
        return
      }
    }

    if (dprops.diskHasChanges && !dprops.motorRunning) {
      if (await handleSaveWritableFile(index)) {
        dprops.diskHasChanges = false
        dprops.lastLocalWriteTime = Date.now()
        passSetDriveProps(dprops)
      }
    }
  }, 3 * 1000, index)
  return () => clearInterval(timer)
}

const resetAllDiskDrives = () => {
  for (let i=0; i < MAX_DRIVES; i++) {
    handleSetDiskData(i, new Uint8Array(), "", null, null, -1)
  }
}

export const handleSetDiskFromFile = async (disk: string,
  updateDisplay: UpdateDisplay, driveIndex: number = 0) => {
  let data: ArrayBuffer
  try {
    const res = await fetch("disks/" + disk)
    data = await res.arrayBuffer()
  } catch {
   return
  }
  resetAllDiskDrives()
  handleSetDiskData(driveIndex, new Uint8Array(data), disk, null, null, -1)
  passSetRunMode(RUN_MODE.NEED_BOOT)
  const helpFile = replaceSuffix(disk, "txt")
  try {
    const help = await fetch("disks/" + helpFile, { credentials: "include", redirect: "error" })
    let helptext = "<Default>"
    if (help.ok) {
      helptext = await help.text()
      // Hack: when running on localhost, if the file is missing it just
      // returns the index.html. So just return an empty string instead.
      if (helptext.startsWith("<!DOCTYPE html>")) {
        helptext = "<Default>"
      }
      if (helpFile === "TotalReplay.txt") {
        helptext = parseGameList(helptext)
      }
      updateDisplay(0, helptext)
    }      
  } catch {
    // If we don't have a help text file, just revert to the default text.
    updateDisplay(0, "<Default>")
  }
}

export const handleSaveWritableFile = async (index: number, writableFileHandle: FileSystemFileHandle|null = null) => {
  let success = false

  if (writableFileHandle === null) {
    writableFileHandle = driveProps[index].writableFileHandle
  }

  const dprops = driveProps[index]

  if (writableFileHandle) {
    // Handle browser FileSystemFileHandle writes
    try {
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