import { getBlobFromDiskData } from "./diskdrive"
import { diskImages } from "./diskimages"
import * as fflate from "fflate"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import { isHardDriveImage, RUN_MODE, MAX_DRIVES, replaceSuffix, FILE_SUFFIXES_DISK } from "../../../common/utility"
// import { iconKey, iconData, iconName } from "../../img/iconfunctions"
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
  // Also preserve writableFileHandle (custom Electron handlers aren't sent to worker)
  const existingWritableFileHandle = driveProps[props.index].writableFileHandle
  
  if (props.diskData.length === 0) {
    const tmp = driveProps[props.index].diskData
    const diskHasChanges = driveProps[props.index].diskHasChanges
    driveProps[props.index] = props
    driveProps[props.index].diskData = tmp
    driveProps[props.index].diskHasChanges = diskHasChanges
  } else {
    driveProps[props.index] = props
  }
  
  // Always preserve writableFileHandle from UI (worker never has custom handlers)
  if (existingWritableFileHandle && !props.writableFileHandle) {
    driveProps[props.index].writableFileHandle = existingWritableFileHandle
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
  writableFileHandle: WritableFileHandle | null,
  lastLocalWriteTime: number) => {
  driveProps[index].filename = filename
  driveProps[index].diskData = data
  driveProps[index].lastLocalWriteTime = lastLocalWriteTime
  driveProps[index].cloudData = cloudData
  driveProps[index].writableFileHandle = writableFileHandle
  
  // Only send FileSystemFileHandle to worker (not custom handlers with functions)
  // Custom handlers can't be cloned via postMessage
  const isFileSystemHandle = writableFileHandle && "getFile" in writableFileHandle
  const propsForWorker = {
    ...driveProps[index],
    writableFileHandle: isFileSystemHandle ? writableFileHandle : null
  }
  passSetDriveNewData(propsForWorker)
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
  writableFileHandle: WritableFileHandle | null) => {
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
    console.log("CORS fetch: " + proxy + url)
    const response = await fetch(proxy + url)
    return response
  } catch {
    return null
  }
}

// const fetchWithCT6502Proxy = async (url: string) => {
//   // Ask CT6502 for why we need to use this favicon header
//   const favicon: { [key: string]: string } = {}
//   favicon[iconKey()] = iconData()
//   try {
//     const fullURL = iconName() + url
//     const response = await fetch(fullURL, { headers: favicon })
//     return response
//   } catch (error) {
//     console.error("CT6502 proxy fetch failed:", error)
//     return null
//   }
// }

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

  let response: Response | null = null
  
  // Try direct fetch first (works in Electron with CORS bypass)
  console.log(`🌐 Attempting direct fetch: ${url}`)
  try {
    response = await fetch(url)
    if (response.ok) {
      console.log(`✅ Direct fetch succeeded: ${url}`)
    } else {
      console.log(`❌ Direct fetch failed with status ${response.status}: ${url}`)
      response = null
    }
  } catch (error) {
    console.log(`❌ Direct fetch failed with error: ${error}`)
    response = null
  }

  // If direct fetch failed, try CORS proxies
  if (!response) {
    const corsURL = "https://proxy.corsfix.com/?"
    console.log(`🔄 Trying CORS proxy: ${corsURL}${url}`)
    response = await fetchWithCorsProxy(corsURL, url)

    if (response && response.ok) {
      console.log(`✅ CORS proxy succeeded: ${corsURL}${url}`)
    } else {
      console.error(`❌ All fetch methods failed for: ${url}`)
      return
    }
  }

  showGlobalProgressModal(false)

  try {
    console.log(`📥 Downloading response body (Content-Length: ${response.headers.get("content-length") || "unknown"})...`)
    const fileBuffer = await response.arrayBuffer()
    console.log(`✅ Downloaded ${fileBuffer.byteLength} bytes`)

    if (url.toLowerCase().endsWith(".zip")) {
      console.log("📦 Unzipping file...")
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
              console.log(`📄 Extracted file: ${name} (${data.length} bytes)`)
              return
            }
          }
          file.start()
          return
        }
      }
      unzipper.push(new Uint8Array(fileBuffer), true)
    } else {
      const urlObj = new URL(url)
      name = url
      const hasSlash = urlObj.pathname.lastIndexOf("/")
      if (hasSlash >= 0) {
        name = urlObj.pathname.substring(hasSlash + 1)
      }

      buffer = fileBuffer
      console.log(`📄 File loaded: ${name} (${buffer.byteLength} bytes)`)
    }

    if (buffer) {
      // If we are loading from a URL, reset all drives. Fixes issue#186
      console.log(`💾 Setting disk data for drive ${index}...`)
      resetAllDiskDrives()
      handleSetDiskOrFileFromBuffer(index, buffer, name, cloudData || null, null)
      console.log("✅ Disk loaded successfully")
    } else {
      console.error("❌ No buffer data available after download")
      // $TODO: Add error handling
    }
  } catch (error) {
    console.error(`❌ Error processing download for "${url}":`, error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
  }
}

export const prepWritableFile = async (index: number, writableFileHandle: WritableFileHandle) => {
  console.log(`🔄 prepWritableFile: Starting auto-save timer for drive ${index}`)
  const timer = setInterval(async (index: number) => {
    const dprops = handleGetDriveProps(index)
    if (getHotReload()) {
      // Only FileSystemFileHandle supports getFile() for hot reload
      if ("getFile" in writableFileHandle && typeof writableFileHandle.getFile === "function") {
        const file = await writableFileHandle.getFile()
        if (dprops.lastLocalWriteTime > 0 && file.lastModified > dprops.lastLocalWriteTime) {
          console.log(`🔄 Hot reload detected for drive ${index}`)
          handleSetDiskOrFileFromBuffer(index, await file.arrayBuffer(), file.name, null, writableFileHandle)
          passSetRunMode(RUN_MODE.NEED_BOOT)
          return
        }
      }
    }

    if (dprops.diskHasChanges && !dprops.motorRunning) {
      console.log(`💾 Drive ${index} has changes and motor stopped, attempting save...`)
      if (await handleSaveWritableFile(index)) {
        console.log(`✅ Save successful for drive ${index}`)
        dprops.diskHasChanges = false
        dprops.lastLocalWriteTime = Date.now()
        
        // Only send FileSystemFileHandle to worker (not custom handlers with functions)
        const isFileSystemHandle = dprops.writableFileHandle && "getFile" in dprops.writableFileHandle
        const propsForWorker = {
          ...dprops,
          writableFileHandle: isFileSystemHandle ? dprops.writableFileHandle : null
        }
        passSetDriveProps(propsForWorker)
      } else {
        console.log(`❌ Save failed for drive ${index}`)
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

export const handleSaveWritableFile = async (index: number, writableFileHandle: WritableFileHandle|null = null) => {
  console.log(`💾 handleSaveWritableFile called for drive ${index}`)
  let success = false

  if (writableFileHandle === null) {
    writableFileHandle = driveProps[index].writableFileHandle
    console.log("📁 Using stored writableFileHandle:", writableFileHandle ? "present" : "null")
  }

  const dprops = driveProps[index]

  if (writableFileHandle) {
    try {
      console.log(`🔨 Creating blob from disk data: ${dprops.filename}, ${dprops.diskData.length} bytes`)
      const blob = getBlobFromDiskData(dprops.diskData, dprops.filename)
      console.log("📝 Calling createWritable()...")
      const writable = await writableFileHandle.createWritable()

      console.log("✍️ Calling write() with blob...")
      // Both browser FileSystemWritableFileStream and custom handler support write()
      await writable.write(blob)
      console.log("🔒 Calling close()...")
      await writable.close()
      
      success = true
      console.log("✅ handleSaveWritableFile completed successfully")
    } catch (ex) {
      console.log(`❌ Error saving writable file: ${ex}`)
    }
  } else {
    console.log(`⚠️ No writableFileHandle available for drive ${index}`)
  }

  return success
}