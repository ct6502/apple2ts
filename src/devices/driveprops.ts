import { RUN_MODE, replaceSuffix } from "../emulator/utility/utility";
import { iconKey, iconData, iconName } from "../img/icons";
import { passSetDriveProps, passSetRunMode } from "../main2worker";
import { diskImages } from "./diskimages";

// Technically, all of these properties should be in the main2worker.ts file,
// since they just maintain the state that needs to be passed to/from the
// emulator. But all of the helper functions were getting too large,
// so now it's all contained here.

const initDriveProps = (drive: number): DriveProps => {
  return {
    hardDrive: false,
    drive: drive,
    filename: "",
    status: "",
    diskHasChanges: false,
    motorRunning: false,
    diskData: new Uint8Array()
  }
}

const driveProps: DriveProps[] = [initDriveProps(0), initDriveProps(1), initDriveProps(2)];
driveProps[0].hardDrive = true

export const handleGetFilename = (drive: number) => {
  let f = driveProps[drive].filename
  if (f !== "") {
    const i = f.lastIndexOf('.')
    if (i > 0) {
      f = f.substring(0, i)
    }
    return f
  }
  return null
}

export const doSetDriveProps = (props: DriveProps) => {
  driveProps[props.drive] = props
}

export const handleGetDriveProps = (drive: number) => {
  return driveProps[drive]
}

export const handleSetDiskData = (drive: number,
  data: Uint8Array, filename: string) => {
  const props = driveProps[drive]
  props.drive = drive
  props.filename = filename
  props.diskData = data
  passSetDriveProps(props)
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
    handleSetDiskData(0, new Uint8Array(buffer), name)
    passSetRunMode(RUN_MODE.NEED_BOOT)
  } catch (e) {
    console.error(`Error fetching URL: ${url}`)
  }
}

const resetAllDiskDrives = () => {
  handleSetDiskData(0, new Uint8Array(), "")
  handleSetDiskData(1, new Uint8Array(), "")
  handleSetDiskData(2, new Uint8Array(), "")
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

