import { COLOR_MODE, UI_THEME } from "../common/utility"
import { useGlobalContext } from "./globalcontext"
import { passSpeedMode, passSetRamWorks, passPasteText, handleGetState6502, passSetShowDebugTab } from "./main2worker"
import { setDefaultBinaryAddress, handleSetDiskFromURL } from "./devices/disk/driveprops"
import { audioEnable } from "./devices/audio/speaker"
import { setCapsLock, setColorMode, setShowScanlines, setTheme } from "./ui_settings"

export const handleInputParams = (paramString = "") => {
  // Most parameters are case insensitive. The only exception is the BASIC
  // parameter, where we want to preserve the case of the program.
  if (paramString.length === 0) {
    paramString = window.location.search
  }
  const params = new URLSearchParams(paramString.toLowerCase())
  const porig = new URLSearchParams(paramString)

  if (params.get("capslock") === "off") {
    setCapsLock(false)
  }

  if (params.get("debug") === "on") {
    passSetShowDebugTab(true)
  }

  const speed = params.get("speed")
  const speedMap: { [key: string]: number } = {
    snail: -2,
    slow: -1,
    normal: 0,
    two: 1,
    three: 2,
    fast: 3,
    warp: 4,
    ludicrous: 4,
  }
  if (speed && speedMap[speed] !== undefined) {
    passSpeedMode(speedMap[speed])
  }

  if (params.get("sound") === "off") {
    audioEnable(false)
  }

  const colorMode = params.get("color")
  if (colorMode) {
    const colors = ["color", "nofringe", "green", "amber", "white", "inverse"]
    const mode = colors.indexOf(colorMode)
    if (mode >= 0) setColorMode(mode as COLOR_MODE)
  }

  if (params.get("scanlines") === "on") {
    setShowScanlines(true)
  } else if (params.get("scanlines") === "off") {
    setShowScanlines(false)
  }

  const ramDisk = params.get("ramdisk")
  if (ramDisk) {
    const sizes = ["64", "512", "1024", "4096", "8192"]
    const index = sizes.indexOf(ramDisk)
    if (index >= 0) {
      passSetRamWorks(parseInt(sizes[index]))
    }
  }

  const theme = params.get("theme")
  if (theme) {
    switch (theme.toLocaleLowerCase()) {
      case "classic":
        setTheme(UI_THEME.CLASSIC)
        break

      case "dark":
        setTheme(UI_THEME.DARK)
        break

      case "minimal":
        setTheme(UI_THEME.MINIMAL)
        break
    }
  }

  const address = params.get("address")
  if (address) {
    setDefaultBinaryAddress(parseInt(address, 16))
  }

  const tour = params.get("tour")
  if (tour) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { setRunTour } = useGlobalContext()
    setRunTour(tour)
  }

  const run = params.get("run")
  const doRun = !(run === "0" || run === "false")

  // Use the original case of the text string or BASIC program.
  const text = porig.get("basic") || porig.get("BASIC") || porig.get("text") || porig.get("TEXT")
  const hasBasicProgram = text !== null
  if (text) {
    const trimmed = text.trim()
    const hasLineNumbers = /^[0-9]/.test(trimmed) || /[\n\r][0-9]/.test(trimmed)
    const cmd = trimmed + ((hasLineNumbers && doRun) ? "\nRUN\n" : "\n")
    const waitForBoot = setInterval(() => {
      // Wait a bit to give the emulator time to start and boot any disks.
      const cycleCount = handleGetState6502().cycleCount
      if (cycleCount > 2000000) {
        clearInterval(waitForBoot)
        passPasteText(cmd)
      }
    }, 100)
  }

  return hasBasicProgram
}

// Examples:
// https://apple2ts.com/?color=white&speed=fast#https://a2desktop.s3.amazonaws.com/A2DeskTop-1.4-en_800k.2mg
// https://apple2ts.com/#https://archive.org/download/TotalReplay/Total%20Replay%20v5.0.1.hdv
// https://apple2ts.com/#https://archive.org/download/wozaday_Davids_Midnight_Magic/00playable.woz
export const handleFragment = async (updateDisplay: UpdateDisplay, hasBasicProgram: boolean) => {
  const fragment = window.location.hash
  // If you start npm locally with 'npm start --xyz=blahblah', then npm
  // will automatically create an environment variable "npm_config_xyz".
  // So here we check for a --urlparam command line argument and load it if it exists.
  // For example, npm start --urlparam=speed=fast#Replay
  if (process.env.npm_config_urlparam) {
    if (window.location.search === "") {
      window.location.href = window.location.pathname + "?" + process.env.npm_config_urlparam
    }
  }
  if (fragment.length >= 2) {
    const params = new URLSearchParams(window.location.search)
    const cloudProvider = params.get("cloudProvider")
    const regex: RegExp = /access_token=([^&]+)/
    const matches = regex.exec(window.location.hash)
    
    if (cloudProvider && matches && matches.length > 0) {
      // Handle access token in fragment for cloud drive providers
      const opener = window.opener as OpenerWindow
      opener.accessToken = matches[1]
      window.close()
    } else {
      const url = decodeURI(fragment.substring(1))
      handleSetDiskFromURL(url, updateDisplay)
    }
  } else if (hasBasicProgram) {
    // If we had a BASIC program in the URL, and we didn't have a floppy,
    // then boot our default blank ProDOS disk.
    handleSetDiskFromURL("blank.po", updateDisplay)
  }
}
