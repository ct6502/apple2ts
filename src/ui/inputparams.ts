import { COLOR_MODE, UI_THEME } from "../common/utility"
import { useGlobalContext } from "./globalcontext"
import { passSpeedMode, passSetRamWorks, passPasteText, handleGetState6502, passSetShowDebugTab, passSetMachineName, passSetBinaryBlock, handleGetSpeedMode } from "./main2worker"
import { setDefaultBinaryAddress, handleSetDiskFromURL } from "./devices/disk/driveprops"
import { audioEnable } from "./devices/audio/speaker"
import { setAppMode, setCapsLock, setColorMode, setGhosting, setHotReload, setShowScanlines, setTheme } from "./ui_settings"
import * as pako from "pako"
import { MaximumSpeedMode } from "./controls/speeddropdown"
import { setPreferenceSpeedMode } from "./localstorage"
import { Expectin } from "./expectin"

export const handleInputParams = (paramString = "") => {
  // Most parameters are case insensitive. The only exception is the BASIC
  // parameter, where we want to preserve the case of the program.
  if (paramString.length === 0) {
    paramString = window.location.search
  }
  const params = new URLSearchParams(paramString.toLowerCase())
  const porig = new URLSearchParams(paramString)

  if (params.get("appmode")) {
    setAppMode(params.get("appmode") as string)
  }

  if (params.get("capslock") === "off") {
    setCapsLock(false)
  }

  if (params.get("debug") === "on") {
    passSetShowDebugTab(true)
  }

  const ghost = params.get("ghosting")
  if (ghost === "on") {
    setGhosting(true)
  } else if (ghost === "off") {
    setGhosting(false)
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

  const scanlines = params.get("scanlines")
  if (scanlines === "on") {
    setShowScanlines(true)
  } else if (scanlines === "off") {
    setShowScanlines(false)
  }

  const machineName = params.get("machine")?.toUpperCase()
  if (machineName) {
    if (machineName === "APPLE2EU") {
      passSetMachineName("APPLE2EU")
    } else {
      passSetMachineName("APPLE2EE")
    }
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
  let binaryRunAddress = 0x0300
  if (address) {
    binaryRunAddress = parseInt(address, 16)
    setDefaultBinaryAddress(binaryRunAddress)
  }

  let hasBasicProgram = false

  const binary64 = porig.get("binary")  // Use original case for base64
  if (binary64) {
    const isGZIP = binary64.startsWith("GZIP")
    const dataToDeflate = isGZIP ? binary64.substring(4) : binary64
    // Convert base64 string to Uint8Array
    const binary = atob(decodeURIComponent(dataToDeflate))
    let data = new Uint8Array(binary.split("").map(char => char.charCodeAt(0)))
    if (isGZIP) {
      data = pako.ungzip(data)
    }
    hasBasicProgram = true
    const waitForBoot = setInterval(() => {
      // Wait a bit to give the emulator time to start and boot any disks.
      const cycleCount = handleGetState6502().cycleCount
      if (cycleCount > 2000000) {
        clearInterval(waitForBoot)
        passSetBinaryBlock(binaryRunAddress, data, false)
      }
    }, 100)
  }
  

  const tour = params.get("tour")
  if (tour) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { setRunTour } = useGlobalContext()
    setRunTour(tour)
  }

  const hotReload = params.get("hotreload")
  if (hotReload) {
    setHotReload(hotReload === "true")
  }

  const run = params.get("run")
  const doRun = !(run === "0" || run === "false")

  // Use the original case of the text string or BASIC program.
  const text = porig.get("basic") || porig.get("BASIC") || porig.get("text") || porig.get("TEXT")
  hasBasicProgram = hasBasicProgram || (text !== null)
  if (text) {
    const trimmed = text.trim()
    const hasLineNumbers = /^[0-9]/.test(trimmed) || /[\n\r][0-9]/.test(trimmed)
    const sentinel = `REM ${Date.now()}`
    const cmd = `${trimmed}\n${sentinel}\n`

    sendTextAndWait("", "]", () => {
      const prevSpeedMode = handleGetSpeedMode()
      setPreferenceSpeedMode(MaximumSpeedMode)

      sendTextAndWait(cmd, sentinel, () => {
        setPreferenceSpeedMode(prevSpeedMode)
        passPasteText((hasLineNumbers && doRun) ? "\nRUN\n" : "\n")
      })
    })
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

const sendTextAndWait = (sendText: string, waitText: string, callback: () => void) => {
  const expectinJson =
    {
        "commands": [
            {
                "send": sendText
            },
            {
                "expect": [
                    {
                        "match": waitText,
                        "commands": [
                            {
                                "disconnect": {}
                            }
                        ]
                    }
                ]
            }
        ]
    }
  const expectin = new Expectin(JSON.stringify(expectinJson))
  expectin.Run()

  const interval = window.setInterval(() => {
    if (!expectin.IsRunning()) {
      clearInterval(interval)
      callback()
    }
  }, 100)
}