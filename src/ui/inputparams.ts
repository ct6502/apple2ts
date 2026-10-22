import { COLOR_MODE, MONITOR_MODE, RUN_MODE, UI_THEMES, parseDiskSwapperParam } from "../common/utility"
import { useGlobalContext } from "./globalcontext"
import { passSpeedMode, passSetRamWorks, passPasteText, handleGetState6502, passSetShowDebugTab, passSetMachineName, passSetBinaryBlock, handleGetSpeedMode, passSetAppMode, passSetRunMode, passSetIsDebugging, passEnableGamePatches } from "./main2worker"
import { setDefaultBinaryAddress, handleSetDiskFromURL, handleSetDiskSwapperFromURLs, resetAllDiskDrives } from "./devices/disk/driveprops"
import { handleSetVeraSdFromURL } from "./devices/vera/verasdicon"
import { loadOneDriveScript } from "./devices/disk/cloudscriptloader"
import { isOneDriveMsalAuthCallback } from "./devices/disk/onedrive_authredirect"
import { audioEnable } from "./devices/audio/speaker"
import { setAppMode, setColorMode, setMonitorMode, setTabView, setTheme, setUIStateBoolean } from "./ui_settings"
import * as pako from "pako"
import { MaximumSpeedMode } from "./controls/speeddropdown"
import { getPreferenceSlotConfig, setPreferenceSlotConfig, setPreferenceSpeedMode, setPreferenceVeraSlot } from "./localstorage"
import { Expectin } from "./api/expectin"
import { notifySettingsChanged } from "./settingschange"

export const handleInputParams = (paramString = "") => {
  // Most parameters are case insensitive. The only exception is the BASIC
  // parameter, where we want to preserve the case of the program.
  if (paramString.length === 0) {
    paramString = window.location.search
  }
  const params = new URLSearchParams(paramString.toLowerCase())
  const porig = new URLSearchParams(paramString)

  const tab = (params.get("tab") as string || "").toLowerCase()
  const tabNames = ["info", "debug", "basic", "expectin", "vera", "ai"]
  if (tab) {
    let tabNum = tabNames.indexOf(tab)
    if (tab === "agent") tabNum = 5
    if (tabNum >= 0) {
      setUIStateBoolean("infoPanel", true)
      setTabView(tabNum)
      passSetIsDebugging(tabNum === 1)
      passSetShowDebugTab(tabNum === 1)
      notifySettingsChanged(["panels.tab"], "external")
    }
  }

  if (params.get("debug") === "on") {
    setTabView(tabNames.indexOf("debug"))
    passSetIsDebugging(true)
    passSetShowDebugTab(true)
    notifySettingsChanged(["panels.tab"], "external")
  }

  if (params.get("gamepatches") === "off") {
    passEnableGamePatches(false)
    setUIStateBoolean("enableGamePatches", false)
  }

  const mode = params.get("appmode") as string
  if (mode) {
    setAppMode(mode)
    // Be sure to pass to the emulator, so we can disable breakpoints, etc.
    passSetAppMode(mode)
  }

  if (params.get("capslock") === "off") {
    setUIStateBoolean("lowercaseMode", true)
  }

  const crtDistort = params.get("crtdistort")
  if (crtDistort === "on") {
    setUIStateBoolean("crtDistortion", true)
  } else if (crtDistort === "off") {
    setUIStateBoolean("crtDistortion", false)
  }

  const ghost = params.get("ghosting")
  if (ghost === "on") {
    setUIStateBoolean("ghosting", true)
  } else if (ghost === "off") {
    setUIStateBoolean("ghosting", false)
  }

  const speed = params.get("speed")
  const speedMap: Record<string, number> = {
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

  const monitorMode = params.get("monitormode")?.toLowerCase()
  if (monitorMode) {
    if (monitorMode === "ntsc") {
      setMonitorMode(MONITOR_MODE.NTSC)
    } else if (monitorMode === "rgb") {
      setMonitorMode(MONITOR_MODE.RGB)
    }
  }

  const scanlines = params.get("scanlines")
  if (scanlines === "on") {
    setUIStateBoolean("showScanlines", true)
  } else if (scanlines === "off") {
    setUIStateBoolean("showScanlines", false)
  }

  const machineName = params.get("machine")?.toUpperCase()
  if (machineName) {
    if (machineName === "APPLE2P") {
      passSetMachineName("APPLE2P")
    } else if (machineName === "APPLE2EU") {
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

  const currentSlotConfig = getPreferenceSlotConfig()
  const nextSlotConfig = { ...currentSlotConfig }
  let slotConfigChanged = false

  const validCards: Record<number, string[]> = {
    1: ["none", "ssc"],
    2: ["none", "vera", "passport", "softcard"],
    3: ["none", "aux", "videoterm", "vidhd"],
    4: ["none", "mouse", "mockingboard", "vera", "softcard"],
    5: ["none", "mouse", "mockingboard", "softcard"],
    6: ["none", "disk2"],
    7: ["none", "smartport"],
  }

  for (let slotNum = 1; slotNum <= 7; slotNum++) {
    const cardParam = params.get(`slot${slotNum}`)?.toLowerCase()
    if (cardParam && validCards[slotNum]?.includes(cardParam)) {
      const card = cardParam as SLOT_CARD_ID
      if (card !== "none" && card !== "mockingboard") {
        for (let otherSlot = 1; otherSlot <= 7; otherSlot++) {
          if (otherSlot !== slotNum && nextSlotConfig[otherSlot as 1 | 2 | 3 | 4 | 5 | 6 | 7] === card) {
            nextSlotConfig[otherSlot as 1 | 2 | 3 | 4 | 5 | 6 | 7] = "none"
          }
        }
      }
      nextSlotConfig[slotNum as 1 | 2 | 3 | 4 | 5 | 6 | 7] = card
      if (card === "vera") {
        setPreferenceVeraSlot(slotNum as VERA_SLOT)
        if (!params.get("tab")) {
          setUIStateBoolean("infoPanel", true)
          setTabView(4)
          notifySettingsChanged(["panels.tab", "options.infoPanel"], "external")
        }
      } else if (currentSlotConfig[slotNum as 1 | 2 | 3 | 4 | 5 | 6 | 7] === "vera") {
        setPreferenceVeraSlot(0)
      }
      slotConfigChanged = true
    }
  }

  const veraSlotParam = params.get("veraslot")
  if (veraSlotParam) {
    const vSlot = parseInt(veraSlotParam, 10)
    if (vSlot === 0 || vSlot === 2 || vSlot === 4) {
      setPreferenceVeraSlot(vSlot as VERA_SLOT)
      if (vSlot > 0) {
        const otherVeraSlot = vSlot === 2 ? 4 : 2
        if (nextSlotConfig[otherVeraSlot] === "vera") {
          nextSlotConfig[otherVeraSlot] = "none"
        }
        nextSlotConfig[vSlot as 2 | 4] = "vera"
        slotConfigChanged = true
        if (!params.get("tab")) {
          setUIStateBoolean("infoPanel", true)
          setTabView(4)
          notifySettingsChanged(["panels.tab", "options.infoPanel"], "external")
        }
      }
    }
  }

  if (params.has("s2d1") && nextSlotConfig[2] !== "vera") {
    if (nextSlotConfig[4] === "vera") {
      nextSlotConfig[4] = "none"
    }
    nextSlotConfig[2] = "vera"
    setPreferenceVeraSlot(2)
    slotConfigChanged = true
  }
  if (params.has("s4d1") && nextSlotConfig[4] !== "vera") {
    if (nextSlotConfig[2] === "vera") {
      nextSlotConfig[2] = "none"
    }
    nextSlotConfig[4] = "vera"
    setPreferenceVeraSlot(4)
    slotConfigChanged = true
  }
  const verasd = params.has("verasd") || params.has("sd")
  if (verasd && nextSlotConfig[2] !== "vera" && nextSlotConfig[4] !== "vera") {
    nextSlotConfig[2] = "vera"
    setPreferenceVeraSlot(2)
    slotConfigChanged = true
  }

  if (slotConfigChanged) {
    setPreferenceSlotConfig(nextSlotConfig)
  }

  const theme = params.get("theme")
  if (theme) {
    const option = UI_THEMES.find(candidate => candidate.queryValue === theme.toLocaleLowerCase())
    if (option) setTheme(option.value)
  }

  const address = params.get("address")
  let binaryRunAddress = 0x0300
  if (address) {
    binaryRunAddress = parseInt(address, 16)
    setDefaultBinaryAddress(binaryRunAddress)
  }

  let hasBasicProgram = false

  const run = params.get("run")
  const doRun = !(run === "0" || run === "false")

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
        passSetBinaryBlock(binaryRunAddress, data)
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
    setUIStateBoolean("hotReload", hotReload === "true")
  }

  const hasLineNumbers = (text: string) => {
    // Remove all space characters, then make sure we don't have a CALL -151.
    const trimmed = text.replace(/ +/g, "").toLowerCase()
    if (!trimmed.includes("call-151")) {
      // See if at least half of our lines start with line numbers.
      const lines = trimmed.split(/\r?\n/)
      let lineCount = 0
      for (const line of lines) {
        if (/^[0-9]/.test(line)) {
          lineCount++
          if (lineCount >= lines.length / 2) {
            return true
          }
        }
      }
    }
    return false
  }

  // Use the original case of the text string or BASIC program.
  const isBASIC = porig.get("basic") || porig.get("BASIC")
  const text = isBASIC || porig.get("text") || porig.get("TEXT")
  hasBasicProgram = hasBasicProgram || (text !== null)
  if (text) {
    if (isBASIC || hasLineNumbers(text)) {
      const sentinel = `REM ${Date.now()}`
      const cmd = `${text}\n${sentinel}\n`
      sendTextAndWait("", "]", () => {
        const prevSpeedMode = handleGetSpeedMode()
        setPreferenceSpeedMode(MaximumSpeedMode)
        sendTextAndWait(cmd, sentinel, () => {
          setPreferenceSpeedMode(prevSpeedMode)
          if (doRun) {
            passPasteText("\nRUN\n")
          }
        })
      })
    } else {
      // Add a newline so running a program from Total Replay works.
      // This may need to be revisited in the future if someone complains
      // about the additional newline.
      // https://github.com/ct6502/apple2ts/issues/197
      // Do not add the newline if we are sending a non-ASCII character (like ESC)
      const nonASCIIchar = text.length === 1 && text.charCodeAt(0) < 32
      const cmd = text + (nonASCIIchar ? "" : "\n")
      const waitForBoot = setInterval(() => {
        // Wait a bit to give the emulator time to start and boot any disks.
        const cycleCount = handleGetState6502().cycleCount
        if (cycleCount > 2000000) {
          clearInterval(waitForBoot)
          passPasteText(cmd)
        }
      }, 100)
    }
  }

  const hex = porig.get("hex")  // Use original case for base64
  if (hex) {
    // Convert string of two-digit hex values to Uint8Array
    const data = new Uint8Array(hex.length / 2)
    for (let i = 0; i < data.length; i++) {
      data[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16)
    }
    if (!hasBasicProgram) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
      setTimeout(() => { passSetRunMode(RUN_MODE.NEED_RESET) }, 500)
    }
    const waitForBoot = setInterval(() => {
      // Wait a bit to give the emulator time to start and boot any disks.
      const cycleCount = handleGetState6502().cycleCount
      if (cycleCount > 2000000) {
        clearInterval(waitForBoot)
        passSetBinaryBlock(binaryRunAddress, data)
        if (doRun) {
          passPasteText(`\nCALL -151\n${binaryRunAddress.toString(16)}G\n`)
        }
      }
    }, 100)
  }

  return hasBasicProgram
}

// Examples:
// https://apple2ts.com/?color=color&speed=fast#https://a2desktop.s3.amazonaws.com/A2DeskTop-1.4-en_800k.2mg
// https://apple2ts.com/#https://archive.org/download/TotalReplay/Total%20Replay%20v5.0.1.hdv
// https://apple2ts.com/#https://archive.org/download/wozaday_Davids_Midnight_Magic/00playable.woz

// The OneDrive file-picker SDK routes its OAuth flow through this page. It first
// navigates its popup to <ourpage>?oauth=<config>, and later back to
// <ourpage>#access_token=...&state=... In both cases the onAuth() handler in
// onedrive.js must run here: it reads these parameters, redirects the popup to
// the Microsoft login page, and finally posts the token back to the opener.
// This mirrors the SDK's own detection, which reads both the query and the hash.
const isOneDriveAuthRedirect = () => {
  const params = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
  const has = (key: string) => params.has(key) || hashParams.has(key)
  return has("oauth") || ((has("access_token") || has("error")) && has("state"))
}

export const handleFragment = async (
  updateDisplay?: UpdateDisplay,
  hasBasicProgram = false,
  searchString = "",
  hashString = "",
) => {
  const search = searchString.length > 0 ? searchString : window.location.search
  const fragment = hashString.length > 0 ? hashString : window.location.hash

  // URL parameters for local development are supplied via the A2TS_URLPARAM
  // environment variable (see vite.config.ts), so here we redirect to that
  // parameter string if it exists.
  //
  // For example: A2TS_URLPARAM="speed=fast#Replay" npm start
  //
  // Older npm versions supported `npm start --urlparam=...`, which set
  // npm_config_urlparam. npm 11+ rejects unknown CLI flags, but vite.config.ts
  // still falls back to npm_config_urlparam for older npm versions.
  if (process.env.A2TS_URLPARAM) {
    if (window.location.search === "") {
      window.location.href = window.location.pathname + "?" + process.env.A2TS_URLPARAM
    }
  }
  if (isOneDriveMsalAuthCallback()) return
  // If this page was opened as a OneDrive file-picker auth popup, load
  // onedrive.js so its onAuth() handler can run. The SDK routes its OAuth flow
  // through this page (first ?oauth=<config>, then #access_token=...&state=...),
  // and onAuth() redirects the popup to the Microsoft login page and posts the
  // token back to the opener. Because the script is now lazy-loaded, without
  // this the popup is stranded on the Apple2TS page.
  if (window.opener && isOneDriveAuthRedirect()) {
    await loadOneDriveScript()
    return
  }

  // Check for multi-drive parameters:
  // Slot 7 Drive 1 (SmartPort 1): s7d1 or hd1 -> drive index 0
  // Slot 7 Drive 2 (SmartPort 2): s7d2 or hd2 -> drive index 1
  // Slot 6 Drive 1 (Disk II 1):   s6d1 or d1  -> drive index 2
  // Slot 6 Drive 2 (Disk II 2):   s6d2 or d2  -> drive index 3
  const params = new URLSearchParams(search.toLowerCase())
  const porig = new URLSearchParams(search)

  const driveParamDefs = [
    { keys: ["s7d1", "hd1"], index: 0 },
    { keys: ["s7d2", "hd2"], index: 1 },
    { keys: ["s6d1", "d1"],  index: 2 },
    { keys: ["s6d2", "d2"],  index: 3 },
  ]

  const driveConfigs: Array<{ index: number; url: string }> = []
  for (const def of driveParamDefs) {
    for (const key of def.keys) {
      if (params.has(key)) {
        let val: string | null = null
        for (const [origKey, origVal] of porig.entries()) {
          if (origKey.toLowerCase() === key) {
            val = origVal
            break
          }
        }
        if (val && val.trim() !== "") {
          driveConfigs.push({ index: def.index, url: val.trim() })
          break
        }
      }
    }
  }

  // VERA SD parameter handling:
  // s2d1, s4d1, or verasd/sd
  let veraSdUrl: string | null = null
  const veraKeys = ["s2d1", "s4d1", "verasd", "sd"]
  for (const key of veraKeys) {
    if (params.has(key)) {
      for (const [origKey, origVal] of porig.entries()) {
        if (origKey.toLowerCase() === key) {
          if (origVal && origVal.trim() !== "") {
            veraSdUrl = origVal.trim()
            break
          }
        }
      }
      if (veraSdUrl) break
    }
  }

  if (driveConfigs.length > 0 || veraSdUrl) {
    if (driveConfigs.length > 0) resetAllDiskDrives()
    let anyLoaded = false
    for (const config of driveConfigs) {
      const parsedUrls = parseDiskSwapperParam(config.url)
      let success = false
      if (parsedUrls.length > 1) {
        success = await handleSetDiskSwapperFromURLs(
          parsedUrls,
          updateDisplay,
          config.index,
          true,
          true,
          true,
        )
      } else {
        success = await handleSetDiskFromURL(
          parsedUrls[0] || config.url,
          updateDisplay,
          config.index,
          undefined,
          undefined,
          undefined,
          true, // preserveDriveIndex
          false,
          true, // noReset
          true, // noBoot
        )
      }
      if (success) anyLoaded = true
    }
    if (veraSdUrl) {
      const success = await handleSetVeraSdFromURL(veraSdUrl)
      if (success) anyLoaded = true
    }
    const hasBootDriveInConfig = driveConfigs.some(c => c.index === 0 || c.index === 2)
    if (fragment.length >= 2 && !hasBootDriveInConfig) {
      const cloudProvider = params.get("cloudProvider")
      const regex: RegExp = /access_token=([^&]+)/
      const matches = regex.exec(fragment)

      if (cloudProvider && matches && matches.length > 0) {
        const opener = window.opener as OpenerWindow
        opener.accessToken = matches[1]
        window.close()
        return
      } else {
        const url = decodeURI(fragment.substring(1))
        const success = await handleSetDiskFromURL(
          url,
          updateDisplay,
          -1,
          undefined,
          undefined,
          undefined,
          true,
          false,
          true,
          true,
        )
        if (success) anyLoaded = true
      }
    }
    if (anyLoaded) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
    }
    return
  }

  if (fragment.length >= 2) {
    const cloudProvider = params.get("cloudProvider")
    const regex: RegExp = /access_token=([^&]+)/
    const matches = regex.exec(fragment)

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
    handleSetDiskFromURL("blank.woz", updateDisplay)
  }
}

const sendTextAndWait = (sendText: string, waitText: string, callback: () => void) => {
  const expectinJson = {
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

  // Safety check: If it turns out we don't have a BASIC program, we don't
  // want to be stuck in ExpectIn forever. This timeout should be long
  // enough that all normal BASIC programs should finish pasting.
  const timeout = (sendText.length > 100) ? (sendText.length / 10) : 10
  let counter = 0
  const interval = window.setInterval(() => {
    counter++
    if (counter > timeout) {
      expectin.Cancel()
    }
    if (!expectin.IsRunning()) {
      clearInterval(interval)
      callback()
    }
  }, 100)
}
