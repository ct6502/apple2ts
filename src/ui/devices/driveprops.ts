import { MAX_DRIVES, RUN_MODE, isHardDriveImage, replaceSuffix } from "../../common/utility"
import { iconKey, iconData, iconName } from "../img/iconfunctions"
import { handleGetRunMode, passPasteText, passSetBinaryBlock, passSetDriveNewData, passSetDriveProps, passSetRunMode } from "../main2worker"
import { diskImages } from "./diskimages"

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
    cloudData: null
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
    driveProps[props.index] = props
    driveProps[props.index].diskData = tmp
  } else {
    driveProps[props.index] = props
  }
}

export const handleGetDriveProps = (index: number) => {
  return driveProps[index]
}

export const handleSetDiskData = (index: number,
  data: Uint8Array, filename: string, cloudData: CloudData | null) => {
  driveProps[index].filename = filename
  driveProps[index].diskData = data
  driveProps[index].cloudData = cloudData
  passSetDriveNewData(driveProps[index])
}

export const handleSetDiskWriteProtected = (index: number, isWriteProtected: boolean) => {
  driveProps[index].isWriteProtected = isWriteProtected
  passSetDriveProps(driveProps[index])
}

const findMatchingDiskImage = (url: string) => {
  const name = decodeURIComponent(url).replace(/[^A-Z]/gi, "").toUpperCase()
  for (let i = 0; i < diskImages.length; i++) {
    const diskname = diskImages[i].file.replace(/[^A-Z]/gi, "").toUpperCase()
    if (diskname.includes(name)) {
      return diskImages[i]
    }
  }
  // If we don't find a disk image in our pre-defined list, just assume
  // that they've given an exact filename in our public folder,
  // including the file suffix.
  return {file: url, url: ""} as diskImage
}

let binaryRunAddress = 0x300
export const setDefaultBinaryAddress = (address: number) => {
  binaryRunAddress = address
}

export const handleSetDiskOrFileFromBuffer = (index: number, buffer: ArrayBuffer,
  filename: string, cloudData: CloudData | null) => {
  const fname = filename.toLowerCase()
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
      if (index > 1) index = 0
    } else {
      if (index < 2) index = 2
    }
    handleSetDiskData(index, new Uint8Array(buffer), filename, cloudData)
    if (handleGetRunMode() === RUN_MODE.IDLE) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
    } else {
//      props.updateDisplay()
    }
  }
}

export const handleSetDiskFromURL = async (url: string,
  updateDisplay: UpdateDisplay) => {
  if (!url.startsWith("http")) {
    const match = findMatchingDiskImage(url)
    handleSetDiskFromFile(match, updateDisplay)
    return
  }
  // Download the file from the fragment URL
  try {
    // Ask CT6502 for why we need to use this favicon header
    const favicon: { [key: string]: string } = {}
    favicon[iconKey()] = iconData()
    const response = await fetch(iconName() + url, { headers: favicon })
    if (!response.ok) {
      console.error(`HTTP error: status ${response.status}`)
      return
    }
    const blob = await response.blob()
    const buffer = await new Response(blob).arrayBuffer()
    const urlObj = new URL(url)
    let name = url
    const hasSlash = urlObj.pathname.lastIndexOf("/")
    if (hasSlash >= 0) {
      name = urlObj.pathname.substring(hasSlash + 1)
    }
    handleSetDiskOrFileFromBuffer(0, buffer, name, null)
  } catch {
    console.error(`Error fetching URL: ${url}`)
  }
}

const resetAllDiskDrives = () => {
  for (let i=0; i < MAX_DRIVES; i++) {
    handleSetDiskData(i, new Uint8Array(), "", null)
  }
}

export const handleSetDiskFromFile = async (disk: diskImage,
  updateDisplay: UpdateDisplay) => {
  let data: ArrayBuffer
  try {
    const res = await fetch("/disks/" + disk.file)
    data = await res.arrayBuffer()
  } catch {
   return
  }
  resetAllDiskDrives()
  handleSetDiskData(0, new Uint8Array(data), disk.file, null)
  passSetRunMode(RUN_MODE.NEED_BOOT)
  const helpFile = replaceSuffix(disk.file, "txt")
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
      updateDisplay(0, helptext)
    }      
  } catch {
    // If we don't have a help text file, just revert to the default text.
    updateDisplay(0, "<Default>")
  }
}

// export function handleSetCloudUrl(url: string) {
// }