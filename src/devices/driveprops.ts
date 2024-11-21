import { isHardDriveImage } from "../emulator/devices/decodedisk";
import { RUN_MODE, replaceSuffix } from "../emulator/utility/utility";
import { iconKey, iconData, iconName } from "../img/icons";
import { handleGetRunMode, passPasteText, passSetBinaryBlock, passSetDriveNewData, passSetDriveProps, passSetRunMode } from "../main2worker";
import { diskImages } from "./diskimages";

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
    diskData: new Uint8Array()
  }
}

const driveProps: DriveProps[] = [initDriveProps(0, 1, true), initDriveProps(1, 2, true),
  initDriveProps(2, 1, false), initDriveProps(3, 2, false)];

export const handleGetFilename = (index: number) => {
  let f = driveProps[index].filename
  if (f !== "") {
    const i = f.lastIndexOf('.')
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
  data: Uint8Array, filename: string) => {
  driveProps[index].filename = filename
  driveProps[index].diskData = data
  passSetDriveNewData(driveProps[index])
}

export const handleSetDiskWriteProtected = (index: number, isWriteProtected: boolean) => {
  driveProps[index].isWriteProtected = isWriteProtected
  passSetDriveProps(driveProps[index])
}

const findMatchingDiskImage = (url: string) => {
  const name = decodeURIComponent(url).replace(/[^A-Z]/gi, '').toUpperCase()
  for (let i = 0; i < diskImages.length; i++) {
    const diskname = diskImages[i].file.replace(/[^A-Z]/gi, '').toUpperCase()
    if (diskname.includes(name)) {
      return diskImages[i]
    }
  }
  return null
}

let binaryRunAddress = 0x300
export const setDefaultBinaryAddress = (address: number) => {
  binaryRunAddress = address
}

export const handleSetDiskOrFileFromBuffer = (index: number, buffer: ArrayBuffer, filename: string, address = -1) => {
  const fname = filename.toLowerCase()
  if (fname.endsWith('.bin')) {
    passSetBinaryBlock(address >= 0 ? address : binaryRunAddress, new Uint8Array(buffer), true)
  } else if (fname.endsWith('.bas') || fname.endsWith('.a')) {
    const decoder = new TextDecoder('utf-8');
    const basic = decoder.decode(buffer);
    if (basic !== "") {
      let cmd = '\n'
      if (/^[0-9]/.test(basic)) {
        cmd = '\n\nRUN\n'
      }  
      passPasteText(basic + cmd)
    }
  } else {
    // Force hard drive images to be in "0" or "1" (slot 7 drive 1 or 2)
    if (isHardDriveImage(fname)) {
      if (index > 1) index = 0
    } else {
      if (index < 2) index = 2
    }
    handleSetDiskData(index, new Uint8Array(buffer), filename)
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
    if (match) {
      handleSetDiskFromFile(match, updateDisplay)
      return
    }
  }
  // Download the file from the fragment URL
  try {
    // Ask CT6502 for why we need to use this favicon header
    const favicon: { [key: string]: string } = {};
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
    const hasSlash = urlObj.pathname.lastIndexOf('/')
    if (hasSlash >= 0) {
      name = urlObj.pathname.substring(hasSlash + 1)
    }
    handleSetDiskOrFileFromBuffer(0, buffer, name)
  } catch (e) {
    console.error(`Error fetching URL: ${url}`)
  }
}

const resetAllDiskDrives = () => {
  handleSetDiskData(0, new Uint8Array(), "")
  handleSetDiskData(1, new Uint8Array(), "")
  handleSetDiskData(2, new Uint8Array(), "")
  handleSetDiskData(3, new Uint8Array(), "")
}

export const handleSetDiskFromFile = async (disk: diskImage,
  updateDisplay: UpdateDisplay) => {
  const res = await fetch("/disks/" + disk.file)
  const data = await res.arrayBuffer()
  resetAllDiskDrives()
  handleSetDiskData(0, new Uint8Array(data), disk.file)
  passSetRunMode(RUN_MODE.NEED_BOOT)
  const helpFile = replaceSuffix(disk.file, 'txt')
  const help = await fetch("/disks/" + helpFile, { credentials: "include", redirect: "error" })
  let helptext = ' '
  if (help.ok) {
    helptext = await help.text()
    // Hack: when running on localhost, if the file is missing it just
    // returns the index.html. So just return an empty string instead.
    if (helptext.startsWith('<!DOCTYPE html>')) {
      helptext = ' '
    }
    updateDisplay(0, helptext)
  }
}

