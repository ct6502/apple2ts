import { useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink, faXmark, faClipboard, faPlus, faMinus } from "@fortawesome/free-solid-svg-icons"
import EditField from "../panels/editfield"
import { Droplist } from "../panels/droplist"
import { diskImages } from "../devices/disk/diskimages"
import { newReleases } from "../devices/disk/newreleases"
import CheckBox from "../panels/checkbox"
import { getLowercaseMode, getColorMode, getCrtDistortion, getGhosting, getShowScanlines, getTheme, isEmbedMode, isGameMode, getUIStateBoolean } from "../ui_settings"
import { APP_DEFAULT_MACHINE, APP_MACHINE_NAMES } from "../../common/app_target"
import { UI_THEMES } from "../../common/utility"
import { getMachineProfile, getProfileDefaultSlotConfig, getProfileDefaultSpeedMode, getProfileSlotChoices, getProfileSpeedLabel, getProfileSpeedOptions } from "../../common/machine_profile"
import { isAudioEnabled } from "../devices/audio/speaker"
import { handleGetIsDebugging, handleGetMachineName, handleGetMemSize, handleGetSpeedMode, handleGetSlotConfig } from "../main2worker"
import { useTranslation } from "../../i18n/useTranslation"
import { SLOT_NUMBERS, getSlotOptions } from "../../common/slot_options"
import TabBase from "../tabbase"
import Tab from "../tab"
import { getCardShortLabels, ramdiskParams, getRamdiskValues } from "../ui_utilities"

export enum TAB {
  DISK,
  TEXT,
  HEX,
}

export const getBaseAppUrl = (): string => {
  if (typeof window === "undefined") return "http://localhost:6502/"
  const url = new URL(window.location.href)
  let pathname = url.pathname
  if (pathname.endsWith("/index.html")) {
    pathname = pathname.slice(0, -"/index.html".length + 1)
  } else if (!pathname.endsWith("/")) {
    const lastSlash = pathname.lastIndexOf("/")
    const lastPart = pathname.slice(lastSlash + 1)
    if (lastPart.includes(".")) {
      pathname = pathname.slice(0, lastSlash + 1)
    } else {
      pathname = `${pathname}/`
    }
  }
  return `${url.origin}${pathname}`
}

const dialogPosition = [Math.max(window.innerWidth / 2 - 275, 0), Math.max(window.innerHeight / 2 - 400, 10)]

const LinkBuilder = () => {
  const { t } = useTranslation()
  const cardShortLabels = getCardShortLabels(t)
  const ramdiskValues = getRamdiskValues(t)
  const [showBuilder, setShowBuilder] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dialogRef.current) {
      setDragging(true)
      const div = dialogRef.current as HTMLDivElement
      // Offset of the mouse down event within the dialog title bar.
      // This way we drag the window from where the user clicked.
      setOffset([e.clientX - div.offsetLeft, e.clientY - div.offsetTop])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dragging && dialogRef.current) {
      const div = dialogRef.current as HTMLDivElement
      const left = e.clientX - offset[0]
      const top = e.clientY - offset[1]
      dialogPosition[0] = left
      dialogPosition[1] = top
      div.style.left = `${left}px`
      div.style.top = `${top}px`
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  const colorNames = [
    t("linkBuilder.colorNames.color"),
    t("linkBuilder.colorNames.nofringe"),
    t("linkBuilder.colorNames.green"),
    t("linkBuilder.colorNames.amber"),
    t("linkBuilder.colorNames.white"),
    t("linkBuilder.colorNames.inverse")
  ]
  const colorModes = ["color", "nofringe", "green", "amber", "white", "inverse"]
  const speedParams = ["snail", "slow", "normal", "two", "three", "fast", "warp"]

  const gameModes = [
    t("linkBuilder.gameModes.normal"),
    t("linkBuilder.gameModes.game"),
    t("linkBuilder.gameModes.embed")
  ]
  const [appmode, setAppmode] = useState("")

  // Reverse the logic for these so the default is false and the checkbox is on,
  // but the URL parameter is "xyz=off/false" when it's true
  const [lowercaseMode, setLowercaseMode] = useState(false)
  const [runprogoff, setRunprogoff] = useState(false)
  const [soundoff, setSoundoff] = useState(false)
  const [gamepatchesOff, setGamepatchesOff] = useState(false)

  const [colormode, setColormode] = useState("")
  const [crtdistort, setCrtdistort] = useState(false)
  const [debug, setDebug] = useState(false)
  const [selectedDisk, setSelectedDisk] = useState("")
  const [fragmentURL, setFragmentURL] = useState("")
  const [s6d1Disk, setS6d1Disk] = useState("")
  const [s6d1Url, setS6d1Url] = useState("")
  const [s6d2Disk, setS6d2Disk] = useState("")
  const [s6d2Url, setS6d2Url] = useState("")
  const [s5d1Disk, setS5d1Disk] = useState("")
  const [s5d1Url, setS5d1Url] = useState("")
  const [s5d2Disk, setS5d2Disk] = useState("")
  const [s5d2Url, setS5d2Url] = useState("")
  const [s7d1Disk, setS7d1Disk] = useState("")
  const [s7d1Url, setS7d1Url] = useState("")
  const [s7d2Disk, setS7d2Disk] = useState("")
  const [s7d2Url, setS7d2Url] = useState("")
  const [s2d1Disk, setS2d1Disk] = useState("")
  const [s2d1Url, setS2d1Url] = useState("")
  const [s4d1Disk, setS4d1Disk] = useState("")
  const [s4d1Url, setS4d1Url] = useState("")
  const [extraDriveUrls, setExtraDriveUrls] = useState<Record<string, string[]>>({
    s6d1: [],
    s6d2: [],
    s5d1: [],
    s5d2: [],
    s7d1: [],
    s7d2: [],
    s2d1: [],
    s4d1: [],
  })

  const addExtraDriveUrl = (driveKey: string) => {
    setExtraDriveUrls(prev => ({
      ...prev,
      [driveKey]: [...(prev[driveKey] || []), ""],
    }))
  }

  const removeExtraDriveUrl = (driveKey: string, index: number) => {
    setExtraDriveUrls(prev => ({
      ...prev,
      [driveKey]: (prev[driveKey] || []).filter((_, i) => i !== index),
    }))
  }

  const updateExtraDriveUrl = (driveKey: string, index: number, value: string) => {
    setExtraDriveUrls(prev => {
      const list = [...(prev[driveKey] || [])]
      list[index] = value
      return {
        ...prev,
        [driveKey]: list,
      }
    })
  }
  const [ghosting, setGhosting] = useState(false)
  const [hexAddress, setHexAddress] = useState("")
  const [textBlock, setTextBlock] = useState("")
  const [loadBlock, setLoadBlock] = useState("")
  const [hexBlock, setHexBlock] = useState("")
  const [machine, setMachine] = useState("")
  const [ramdisk, setRamdisk] = useState("")
  const [scanlines, setScanlines] = useState(false)
  const [speedMode, setSpeedMode] = useState(getProfileDefaultSpeedMode(getMachineProfile(APP_DEFAULT_MACHINE)))
  const [theme, setTheme] = useState("")
  const [tabSection, setTabSection] = useState(TAB.DISK)
  const [slotConfig, setSlotConfig] = useState<SlotConfig>(
    getProfileDefaultSlotConfig(getMachineProfile(APP_DEFAULT_MACHINE), APP_DEFAULT_MACHINE),
  )

  // Keep this order fixed: II+, IIe (unenhanced), IIe (enhanced), IIgs, then
  // filter to what this deployment target supports. Both sites are otherwise
  // the same build, so the table also keeps whichever running machine is valid.
  const allMachines = [
    { name: "APPLE2P" as MACHINE_NAME, label: t("machine.models.apple2p") },
    { name: "APPLE2EU" as MACHINE_NAME, label: t("machine.models.apple2eu") },
    { name: "APPLE2EE" as MACHINE_NAME, label: t("machine.models.apple2ee") },
    { name: "APPLE2GS" as MACHINE_NAME, label: "Apple IIgs" },
  ]
  const visibleMachines = allMachines.filter(({ name }) => APP_MACHINE_NAMES.includes(name))
  const machineValues = visibleMachines.map(({ label }) => label)
  // Each droplist row and the MACHINE_NAME it stands for. Retrieving the running
  // machine and reading a user choice both go through this table so the two
  // cannot drift apart - the reason a running IIgs used to come back as an IIe.
  const MACHINE_NAMES: MACHINE_NAME[] = visibleMachines.map(({ name }) => name)
  const machineNameFor = (row: string): MACHINE_NAME =>
    MACHINE_NAMES[machineValues.indexOf(row)] ?? APP_DEFAULT_MACHINE
  const machineRowFor = (name: MACHINE_NAME): string => {
    const exactRow = machineValues[MACHINE_NAMES.indexOf(name)]
    if (exactRow !== undefined) return exactRow
    return machineValues[Math.max(MACHINE_NAMES.indexOf(APP_DEFAULT_MACHINE), 0)]
  }
  const lbMachineName = machineNameFor(machine)

  // The speed rows come from the selected profile, and the panel stores the
  // numeric mode rather than the display label. Labels change when a classic link
  // turns into a GS link, but the mode survives, so a link cannot silently lose its
  // speed parameter just because the visible table was rebuilt.
  const lbProfile = getMachineProfile(lbMachineName)
  const speedOptions = getProfileSpeedOptions(lbProfile)
  const speedNames = speedOptions.map(option => getProfileSpeedLabel(lbProfile, option.mode, t))
  const speedModeForLabel = (label: string): number =>
    speedOptions[speedNames.indexOf(label)]?.mode ?? getProfileDefaultSpeedMode(lbProfile)
  const defaultSpeedMode = getProfileDefaultSpeedMode(lbProfile)
  const speedDisplay = speedNames[speedOptions.findIndex(option => option.mode === speedMode)]
    ?? speedNames[speedOptions.findIndex(option => option.mode === defaultSpeedMode)]
    ?? ""
  const canUseAuxSlot3 = getProfileSlotChoices(lbProfile, lbMachineName, 3)
    .some(choice => choice.card === "aux")

  // A shared link must name the machine unless it is the classic enhanced default,
  // where leaving ?machine= out follows the visitor's own saved choice. The IIgs
  // is always named because otherwise a GS volume can be scanned by an IIe.
  const MACHINE_QUERY_PARAMS: Partial<Record<MACHINE_NAME, string>> = {
    APPLE2EU: "machine=apple2eu",
    APPLE2P: "machine=apple2p",
    APPLE2GS: "machine=apple2gs",
  }
  const machineQueryFor = (name: MACHINE_NAME): string | undefined =>
    MACHINE_QUERY_PARAMS[name]

  // Which floppy bays the current slot config actually exposes. On a IIgs the
  // 5.25" pair is the Disk Port and the 3.5" pair the Smart Port in slot 5;
  // "disk35" is the id an older saved configuration may still carry for the latter.
  const isDiskPortSlot = slotConfig[6] === "disk2" || slotConfig[6] === "gsDiskPort"
  const isThreeInchSlot = slotConfig[5] === "gsSmartPort" || slotConfig[5] === "disk35"


  const themeValues = [
    t("linkBuilder.themes.classic"),
    t("linkBuilder.themes.dark"),
    t("linkBuilder.themes.minimal"),
  ]
  const themeParams = UI_THEMES.map(option => option.queryValue)

  const noneOption = t("linkBuilder.slots.cardNone")
  const customUrlOption = t("linkBuilder.customDiskUrlOption")
  const allDisks = [...diskImages, ...newReleases]
  const uniqueDiskTitles = [...new Set(allDisks.map(disk => disk.title))].sort()
  const diskNames = [t("linkBuilder.customDiskUrlOption"), ...uniqueDiskTitles]
  const isCustomURL = selectedDisk === "" || selectedDisk === t("linkBuilder.customDiskUrlOption")
  const diskOptionsWithNone = [noneOption, customUrlOption, ...uniqueDiskTitles]

  // When fragmentURL changes, generate the link
  const generateLink = () => {
    let link = getBaseAppUrl()
    const params = []

    const appmodeIndex = gameModes.indexOf(appmode)
    if (appmodeIndex === 1) {
      params.push("appmode=game")
    } else if (appmodeIndex === 2) {
      params.push("appmode=embed")
    }

    if (lowercaseMode) {
      params.push("capslock=off")
    }
    const match = colorNames.indexOf(colormode)
    // Don't bother with color=color since it's the default
    if (match > 0) {
      params.push(`color=${colorModes[match]}`)
    }
    if (crtdistort) {
      params.push("crtdistort=on")
    }
    if (debug) {
      params.push("debug=on")
    }
    if (ghosting) {
      params.push("ghosting=on")
    }
    if (hexBlock) {
      const txt = encodeURIComponent(hexBlock.replace(/\s+/g, ""))
      params.push(`hex=${txt}`)
    }
    if (loadBlock && tabSection === TAB.DISK) {
      const txt = encodeURIComponent(loadBlock)
      params.push(`text=${txt}`)
    } else if (textBlock) {
      // We need to url-encode the textBlock, keeping all whitespace
      // and special characters and converting them to URL-safe
      const txt = encodeURIComponent(textBlock)
      params.push(`text=${txt}`)
    }
    if (hexAddress) {
      params.push(`address=${encodeURIComponent(hexAddress)}`)
    }

    const machineQuery = machineQueryFor(lbMachineName)
    if (machineQuery) {
      params.push(machineQuery)
    }

    const ramIndex = ramdiskValues.indexOf(ramdisk)
    if (slotConfig[3] === "aux" && ramIndex > 0) {
      params.push("ramdisk=" + ramdiskParams[ramIndex])
    }

    if (runprogoff) {
      params.push("run=false")
    }
    if (scanlines) {
      params.push("scanlines=on")
    }
    if (soundoff) {
      params.push("sound=off")
    }
    if (gamepatchesOff) {
      params.push("gamepatches=off")
    }

    // The profile's own default speed is the one choice a link need not spell
    // out. Compare modes, not row labels, so a machine switch cannot turn the
    // default into a stray parameter.
    const speedIndex = speedOptions.findIndex(option => option.mode === speedMode)
    if (speedIndex !== -1 && speedMode !== defaultSpeedMode) {
      params.push(`speed=${speedParams[speedIndex]}`)
    }

    const themeIndex = themeValues.indexOf(theme)
    if (themeIndex > 0) {
      params.push(`theme=${themeParams[themeIndex]}`)
    }

    // Slot configuration params: emit slotN=card for any non-default slot
    let hasVera = false
    const profileSlotDefaults = getProfileDefaultSlotConfig(lbProfile, lbMachineName)
    SLOT_NUMBERS.forEach(slot => {
      const card = slotConfig[slot]
      const defaultCard = profileSlotDefaults[slot]
      if (card !== defaultCard) {
        params.push(`slot${slot}=${card}`)
        if (card === "vera") hasVera = true
      }
    })
    // Auto-add tab=vera when VERA is configured, for convenience
    if (hasVera) {
      params.push("tab=vera")
    }

    if (tabSection === TAB.DISK) {
      const drives = [
        { key: "s5d1", disk: s5d1Disk, url: s5d1Url, enabled: isThreeInchSlot },
        { key: "s5d2", disk: s5d2Disk, url: s5d2Url, enabled: isThreeInchSlot },
        { key: "s6d1", disk: s6d1Disk, url: s6d1Url, enabled: isDiskPortSlot },
        { key: "s6d2", disk: s6d2Disk, url: s6d2Url, enabled: isDiskPortSlot },
        { key: "s7d1", disk: s7d1Disk, url: s7d1Url, enabled: slotConfig[7] === "smartport" },
        { key: "s7d2", disk: s7d2Disk, url: s7d2Url, enabled: slotConfig[7] === "smartport" },
        { key: "s2d1", disk: s2d1Disk, url: s2d1Url, enabled: slotConfig[2] === "vera" },
        { key: "s4d1", disk: s4d1Disk, url: s4d1Url, enabled: slotConfig[4] === "vera" },
      ]

      for (const drive of drives) {
        if (!drive.enabled) continue
        const extras = (extraDriveUrls[drive.key] || []).map(u => u.trim()).filter(Boolean)
        if (drive.disk === customUrlOption) {
          const mainUrl = drive.url.trim()
          if (mainUrl !== "") {
            if (extras.length > 0) {
              const swapperParam = `{${[mainUrl, ...extras].join(",")}}`
              params.push(`${drive.key}=${encodeURIComponent(swapperParam)}`)
            } else {
              params.push(`${drive.key}=${encodeURIComponent(mainUrl)}`)
            }
          }
        } else if (drive.disk && drive.disk !== noneOption) {
          const baseName = drive.disk.replace(/\s+/g, "")
          if (extras.length > 0) {
            const swapperParam = `{${[baseName, ...extras].join(",")}}`
            params.push(`${drive.key}=${encodeURIComponent(swapperParam)}`)
          } else {
            params.push(`${drive.key}=${encodeURIComponent(baseName)}`)
          }
        }
      }
    }

    for (let i = 0; i < params.length; i++) {
      link += (i === 0 ? "?" : "&") + params[i]
    }

    if (tabSection === TAB.DISK) {
      const hasExplicitBootDrive = params.some(p =>
        p.startsWith("s5d1=") || p.startsWith("s6d1=") || p.startsWith("s7d1="))
      if (!hasExplicitBootDrive) {
        if (isCustomURL) {
          if (fragmentURL) {
            link += `#${fragmentURL}`
          }
        } else if (selectedDisk) {
          const disk = allDisks.find(d => d.title === selectedDisk)
          if (disk) {
            link += `#${selectedDisk.replace(/\s+/g, "")}`
          }
        }
      }
    }
    return link
  }

  const link = generateLink()

  const testKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow control keys, backspace, delete, arrows, tab, etc.
    const safeKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight",
      "ArrowUp", "ArrowDown", "Tab", "Enter", "Home", "End"]
    if (e.ctrlKey || e.metaKey || e.altKey || safeKeys.includes(e.key)) {
      return
    }
    // Only allow hex digits and space
    if (!/^[0-9a-fA-F\s]$/.test(e.key)) {
      e.preventDefault()
    }
  }

  const resetAllSettings = () => {
    setAppmode(gameModes[0])
    setLowercaseMode(false)
    setRunprogoff(false)
    setSoundoff(false)
    setGamepatchesOff(false)
    setColormode(colorNames[0])
    setCrtdistort(false)
    setDebug(false)
    setGhosting(false)
    setHexAddress("")
    setTextBlock("")
    setLoadBlock("")
    setHexBlock("")
    // Reset to the target's default machine (IIe enhanced on apple2ts, IIgs on
    // apple2gts), not the first row: the rows are user-facing order, while the
    // default machine still keeps the machine= parameter out of a fresh link.
    setMachine(machineRowFor(APP_DEFAULT_MACHINE))
    setRamdisk(ramdiskValues[0])
    setScanlines(false)
    setSelectedDisk("")
    setFragmentURL("")
    setS6d1Disk("")
    setS6d1Url("")
    setS6d2Disk("")
    setS6d2Url("")
    setS5d1Disk("")
    setS5d1Url("")
    setS5d2Disk("")
    setS5d2Url("")
    setS7d1Disk("")
    setS7d1Url("")
    setS7d2Disk("")
    setS7d2Url("")
    setS2d1Disk("")
    setS2d1Url("")
    setS4d1Disk("")
    setS4d1Url("")
    const resetProfile = getMachineProfile(APP_DEFAULT_MACHINE)
    setSpeedMode(getProfileDefaultSpeedMode(resetProfile))
    setTheme(themeValues[0])
    setSlotConfig(getProfileDefaultSlotConfig(resetProfile, APP_DEFAULT_MACHINE))
  }

  const retrieveFromEmulatorSettings = () => {
    // Retrieve all of the emulator settings from their individual local storage
    // keys or from the emulator state and populate the fields in the link builder
    setColormode(colorNames[getColorMode()])
    setCrtdistort(getCrtDistortion())
    setGhosting(getGhosting())
    setScanlines(getShowScanlines())
    setLowercaseMode(getLowercaseMode())
    setDebug(handleGetIsDebugging())
    setSoundoff(!isAudioEnabled())
    setGamepatchesOff(!getUIStateBoolean("enableGamePatches"))
    setTextBlock("")
    setHexBlock("")
    setHexAddress("")

    const machineName = handleGetMachineName()
    setMachine(machineRowFor(machineName))

    const mem = handleGetMemSize()
    const memIndex = mem > 8000 ? 4 : mem > 4000 ? 3 : mem > 1000 ? 2 : mem > 500 ? 1 : 0
    setRamdisk(ramdiskValues[memIndex])

    const currentSpeed = handleGetSpeedMode()
    const retrievedProfile = getMachineProfile(machineName)
    if (currentSpeed >= -2 && currentSpeed <= 4) {
      setSpeedMode(currentSpeed)
    } else {
      setSpeedMode(getProfileDefaultSpeedMode(retrievedProfile))
    }

    setSelectedDisk("")
    setFragmentURL("")
    setS6d1Disk("")
    setS6d1Url("")
    setS6d2Disk("")
    setS6d2Url("")
    setS5d1Disk("")
    setS5d1Url("")
    setS5d2Disk("")
    setS5d2Url("")
    setS7d1Disk("")
    setS7d1Url("")
    setS7d2Disk("")
    setS7d2Url("")
    setS2d1Disk("")
    setS2d1Url("")
    setS4d1Disk("")
    setS4d1Url("")

    const mytheme = getTheme()
    const themeIndex = UI_THEMES.findIndex(option => option.value === mytheme)
    setTheme(themeValues[Math.max(themeIndex, 0)])

    if (isEmbedMode()) {
      setAppmode(gameModes[2])
    } else if (isGameMode()) {
      setAppmode(gameModes[1])
    } else {
      setAppmode(gameModes[0])
    }

    // Retrieve current slot config from emulator
    setSlotConfig({ ...handleGetSlotConfig() })
  }

  const emulatorGeneralSettings =
    <>
      <div className="flex-row">
      <div className="flex-column">
        <Droplist name={t("linkBuilder.userInterface")}
          value={appmode}
          values={gameModes}
          setValue={setAppmode} />
        <Droplist name={t("linkBuilder.machine")}
          value={machine}
          values={machineValues}
          setValue={(val: string) => {
            const next = machineNameFor(val)
            setMachine(val)
            const nextProfile = getMachineProfile(next)
            if (lbProfile.family !== nextProfile.family) {
              // The two families share no slot cards: a classic config carried
              // into a IIgs link would install a Mockingboard over the mouse
              // port, and a GS config carried into a classic link dies in the
              // URL parser because "gsMouse" is not a classic card. A family
              // switch starts from that family's own defaults, speed included.
              setSlotConfig(getProfileDefaultSlotConfig(nextProfile, next))
              setRamdisk(ramdiskValues[0])
              setSpeedMode(getProfileDefaultSpeedMode(nextProfile))
              return
            }
            // Within the classic family only the exact-model slot 3 default
            // changes (II+ videoterm vs IIe aux RAM). Read that from the profile
            // instead of matching machine ids.
            const prevSlot3 = getProfileDefaultSlotConfig(lbProfile, lbMachineName)[3]
            const nextSlot3 = getProfileDefaultSlotConfig(nextProfile, next)[3]
            if (prevSlot3 !== nextSlot3) {
              setSlotConfig(prev => ({ ...prev, 3: nextSlot3 }))
              if (nextSlot3 !== "videoterm") setRamdisk(ramdiskValues[0])
            }
          }} />
        <Droplist name={t("linkBuilder.colorMode")}
          value={colormode}
          values={colorNames}
          setValue={setColormode} />
        <Droplist name={t("linkBuilder.ramDiskSize")}
          value={ramdisk}
          values={ramdiskValues}
          setValue={(val: string) => {
            setRamdisk(val)
            const rIdx = ramdiskValues.indexOf(val)
            if (rIdx > 0 && canUseAuxSlot3 && slotConfig[3] !== "aux") {
              setSlotConfig(prev => ({ ...prev, 3: "aux" }))
            }
          }} />
        <Droplist name={t("linkBuilder.emulatorSpeed")}
          value={speedDisplay}
          values={speedNames}
          setValue={(label: string) => setSpeedMode(speedModeForLabel(label))} />

        <Droplist name={t("linkBuilder.uiTheme")}
          value={theme !== "" ? theme : themeValues[0]}
          values={themeValues}
          setValue={setTheme} />
      </div>
      <div className="flex-column" style={{ marginLeft: "20px" }}>
        <CheckBox name={t("config.crtDistortion")}
          checked={crtdistort}
          setChecked={setCrtdistort} />
        <CheckBox name={t("config.ghosting")}
          checked={ghosting}
          setChecked={setGhosting} />
        <CheckBox name={t("config.scanlines")}
          checked={scanlines}
          setChecked={setScanlines} />
        <CheckBox name={t("config.capsLock")}
          checked={!lowercaseMode}
          setChecked={(on: boolean) => { setLowercaseMode(!on) }} />
        <CheckBox name={t("linkBuilder.showDebugTab")}
          checked={debug}
          setChecked={setDebug} />
        <CheckBox name={t("linkBuilder.sound")}
          checked={!soundoff}
          setChecked={(on: boolean) => { setSoundoff(!on) }} />
        <CheckBox name={t("keyboard.enableGamePatches")}
          checked={!gamepatchesOff}
          setChecked={(on: boolean) => { setGamepatchesOff(!on) }} />
      </div>
    </div>
  </>

  const slotConfiguration = 
    <>
    <div className="dialog-title" style={{ marginBottom: "4px" }}>{t("linkBuilder.slots.configure")}</div>
    {/* Two columns filled top-to-bottom: slots 1-4 left, 5-7 right. The grid
        flows column-major through the four declared rows, so the single map
        below keeps SLOT_NUMBERS order. */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "auto auto",
      gridTemplateRows: "repeat(4, auto)",
      gridAutoFlow: "column",
      columnGap: "20px",
      marginBottom: "8px",
    }}>
      {SLOT_NUMBERS.map(slot => {
        const rawOptions = getSlotOptions(slot, lbMachineName)
        // Filter out cards already installed in another slot (unless card is none or mockingboard)
        const options = rawOptions.filter(o => {
          if (o.card === "none" || o.card === "mockingboard") return true
          if (slotConfig[slot] === o.card) return true
          return !SLOT_NUMBERS.some(otherSlot => otherSlot !== slot && slotConfig[otherSlot] === o.card)
        })
        // Build display label for each option (aux entries include RAM size)
        const getOptionLabel = (o: typeof options[0]) => {
          if (o.card === "aux" && o.ramSizeKb !== undefined) {
            if (o.ramSizeKb <= 64) return "Aux/80Col (64KB)"
            const sizeStr = o.ramSizeKb >= 1024 ? `${o.ramSizeKb / 1024}MB` : `${o.ramSizeKb}KB`
            return `RamWorks (${sizeStr})`
          }
          return cardShortLabels[o.card]
        }
        const cardLabels = options.map(getOptionLabel)
        // Current label: for slot 3 aux, reflect currently chosen ramdisk size
        const currentCard = slotConfig[slot]
        let currentLabel = cardShortLabels[currentCard]
        if (slot === 3 && currentCard === "aux") {
          const ramIdx = ramdiskValues.indexOf(ramdisk)
          const ramSizeKb = parseInt(ramdiskParams[Math.max(ramIdx, 0)]) || 64
          currentLabel = ramSizeKb <= 64 ? "Aux/80Col (64KB)"
            : `RamWorks (${ramSizeKb >= 1024 ? `${ramSizeKb / 1024}MB` : `${ramSizeKb}KB`})`
        }
        return (
          <Droplist
            key={slot}
            name={t("linkBuilder.slots.slot", { slot: String(slot) })}
            value={currentLabel}
            values={cardLabels}
            setValue={(label: string) => {
              const idx = cardLabels.indexOf(label)
              if (idx >= 0) {
                const chosen = options[idx]
                setSlotConfig(prev => {
                  const next = { ...prev, [slot]: chosen.card }
                  if (chosen.card !== "none" && chosen.card !== "mockingboard") {
                    SLOT_NUMBERS.forEach(otherSlot => {
                      if (otherSlot !== slot && next[otherSlot] === chosen.card) {
                        next[otherSlot] = "none"
                      }
                    })
                  }
                  return next
                })
                // For slot 3: sync or reset ramdisk
                if (slot === 3) {
                  if (chosen.card === "aux" && chosen.ramSizeKb !== undefined) {
                    const paramStr = String(chosen.ramSizeKb)
                    const ramIdx = ramdiskParams.indexOf(paramStr)
                    if (ramIdx >= 0) setRamdisk(ramdiskValues[ramIdx])
                  } else {
                    setRamdisk(ramdiskValues[0])
                  }
                }
              }
            }} />
        )
      })}
    </div>
  </>

  const renderDriveCustomUrlInputs = (
    driveKey: string,
    primaryUrl: string,
    setPrimaryUrl: (val: string) => void,
    placeholder: string
  ) => {
    const extras = extraDriveUrls[driveKey] || []
    return (
      <div style={{ marginLeft: "10px", marginRight: "10px", marginBottom: "6px" }}>
        {/* Primary custom URL row */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ flex: 1 }}>
            <EditField
              value={primaryUrl}
              setValue={setPrimaryUrl}
              placeholder={placeholder}
            />
          </div>
          <button
            type="button"
            className="default-button"
            style={{ minWidth: "28px", padding: "4px 8px" }}
            title={t("linkBuilder.addAdditionalDisk")}
            onClick={() => addExtraDriveUrl(driveKey)}>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>

        {/* Extra disk rows */}
        {extras.map((extraVal, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "4px",
              paddingLeft: "16px",
            }}>
            <div style={{ flex: 1 }}>
              <EditField
                value={extraVal}
                setValue={(val) => updateExtraDriveUrl(driveKey, idx, val)}
                placeholder={t("linkBuilder.diskPlaceholder", { num: String(idx + 2) })}
              />
            </div>
            <button
              type="button"
              className="default-button"
              style={{ minWidth: "28px", padding: "4px 8px" }}
              title={t("linkBuilder.removeDisk")}
              onClick={() => removeExtraDriveUrl(driveKey, idx)}>
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <button
              type="button"
              className="default-button"
              style={{ minWidth: "28px", padding: "4px 8px" }}
              title={t("linkBuilder.addAnotherDisk")}
              onClick={() => addExtraDriveUrl(driveKey)}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        ))}
      </div>
    )
  }

  const loadDiskImageOptions =
    <div className="flex-column">
      <Droplist name={t("linkBuilder.diskImageToLoad")}
        value={selectedDisk}
        values={diskNames}
        setValue={setSelectedDisk} />
      <div className="dialog-text" style={{ marginTop: "6px" }}>{t("linkBuilder.customDiskUrl")}</div>
      <div style={{ marginLeft: "10px", marginRight: "10px" }}>
        <EditField
          value={fragmentURL}
          setValue={setFragmentURL}
          disabled={!isCustomURL}
          placeholder="http://example.com/disk.dsk" />
      </div>
      <div className="dialog-title" style={{ marginTop: "12px", marginBottom: "4px" }}>
        {t("linkBuilder.additionalDiskDrives")}
      </div>
      {isThreeInchSlot && (
        <>
          <Droplist
            name={t("linkBuilder.slot5Drive1")}
            value={s5d1Disk || noneOption}
            values={diskOptionsWithNone}
            setValue={setS5d1Disk} />
          {s5d1Disk === customUrlOption && renderDriveCustomUrlInputs("s5d1", s5d1Url, setS5d1Url, "http://example.com/floppy35.dsk")}
          <Droplist
            name={t("linkBuilder.slot5Drive2")}
            value={s5d2Disk || noneOption}
            values={diskOptionsWithNone}
            setValue={setS5d2Disk} />
          {s5d2Disk === customUrlOption && renderDriveCustomUrlInputs("s5d2", s5d2Url, setS5d2Url, "http://example.com/floppy35b.dsk")}
        </>
      )}
      {isDiskPortSlot && (
        <>
          <Droplist
            name={t("linkBuilder.slot6Drive1")}
            value={s6d1Disk || noneOption}
            values={diskOptionsWithNone}
            setValue={setS6d1Disk} />
          {s6d1Disk === customUrlOption && renderDriveCustomUrlInputs("s6d1", s6d1Url, setS6d1Url, "http://example.com/floppy1.dsk")}
          <Droplist
            name={t("linkBuilder.slot6Drive2")}
            value={s6d2Disk || noneOption}
            values={diskOptionsWithNone}
            setValue={setS6d2Disk} />
          {s6d2Disk === customUrlOption && renderDriveCustomUrlInputs("s6d2", s6d2Url, setS6d2Url, "http://example.com/floppy2.dsk")}
        </>
      )}
      {slotConfig[7] === "smartport" && (
        <>
          <Droplist
            name={t("linkBuilder.slot7Drive1")}
            value={s7d1Disk || noneOption}
            values={diskOptionsWithNone}
            setValue={setS7d1Disk} />
          {s7d1Disk === customUrlOption && renderDriveCustomUrlInputs("s7d1", s7d1Url, setS7d1Url, "http://example.com/hd1.hdv")}
          <Droplist
            name={t("linkBuilder.slot7Drive2")}
            value={s7d2Disk || noneOption}
            values={diskOptionsWithNone}
            setValue={setS7d2Disk} />
          {s7d2Disk === customUrlOption && renderDriveCustomUrlInputs("s7d2", s7d2Url, setS7d2Url, "http://example.com/hd2.hdv")}
        </>
      )}
      {slotConfig[2] === "vera" && (
        <div>
          <Droplist
            name={t("linkBuilder.slot2Drive1")}
            value={s2d1Disk || noneOption}
            values={diskOptionsWithNone}
            setValue={setS2d1Disk} />
          {s2d1Disk === customUrlOption && renderDriveCustomUrlInputs("s2d1", s2d1Url, setS2d1Url, "http://example.com/sd.img")}
        </div>
      )}
      {slotConfig[4] === "vera" && (
        <div>
          <Droplist
            name={t("linkBuilder.slot4Drive1")}
            value={s4d1Disk || noneOption}
            values={diskOptionsWithNone}
            setValue={setS4d1Disk} />
          {s4d1Disk === customUrlOption && renderDriveCustomUrlInputs("s4d1", s4d1Url, setS4d1Url, "http://example.com/sd.img")}
        </div>
      )}
      <EditField name={t("linkBuilder.textToType")}
        value={loadBlock}
        setValue={setLoadBlock}
        placeholder="CHOP"
        width="15em" />
    </div>

  const loadBasicProgramOptions =
    <div style={{ minHeight: "150px" }}>
      <textarea
        className="link-builder-textarea"
        value={textBlock}
        rows={5}
        onChange={(e) => setTextBlock(e.target.value)}
        placeholder={t("linkBuilder.enterTextPlaceholder")}
      />
      <CheckBox name={t("linkBuilder.runBasicAfterLoading")}
        checked={!runprogoff}
        setChecked={(on: boolean) => { setRunprogoff(!on) }} />
    </div>

  const loadHexCodeOptions =
    <div style={{ minHeight: "150px" }}>
      <textarea
        className="link-builder-textarea"
        value={hexBlock}
        rows={4}
        onChange={(e) => setHexBlock(e.target.value)}
        onKeyDown={testKey}
        placeholder={t("linkBuilder.enterHexPlaceholder")}
      />
      <EditField name={t("linkBuilder.hexLoadAddress")}
        value={hexAddress}
        setValue={setHexAddress}
        isHex={true}
        placeholder="0300"
        width="5em" />
      <CheckBox name={t("linkBuilder.runHexAfterLoading")}
        checked={!runprogoff}
        setChecked={(on: boolean) => { setRunprogoff(!on) }} />
    </div>

  const startUpOptions =
    <> 
      <div className="flex-row" style={{ marginBottom: "15px", alignItems: "center" }}>
        <div className="dialog-title">{t("linkBuilder.onStartup")}</div>
        <input type="radio"
          id="Address"
          name="breakAt"
          value="address"
          autoComplete="off"
          className="check-radio-box"
          checked={tabSection === TAB.DISK}
          onChange={() => { setTabSection(TAB.DISK) }} />
        <label htmlFor="Address" className="dialog-text flush-left">{t("linkBuilder.loadDiskImage")}</label>
        <input type="radio"
          id="Watchpoint"
          name="watch"
          value="watchpoint"
          autoComplete="off"
          className="check-radio-box"
          checked={tabSection === TAB.TEXT}
          onChange={() => { setTabSection(TAB.TEXT) }} />
        <label htmlFor="Watchpoint" className="dialog-text flush-left">{t("linkBuilder.loadBasicProgram")}</label>
        <input type="radio"
          id="Instruction"
          name="instruction"
          value="instruction"
          autoComplete="off"
          className="check-radio-box"
          checked={tabSection === TAB.HEX}
          onChange={() => { setTabSection(TAB.HEX) }} />
        <label htmlFor="Instruction" className="dialog-text flush-left">{t("linkBuilder.loadHexCode")}</label>
      </div>
      {tabSection === TAB.DISK && loadDiskImageOptions}
      {tabSection === TAB.TEXT && loadBasicProgramOptions}
      {tabSection === TAB.HEX && loadHexCodeOptions}
    </>

  const builderDialog =
    <div className="modal-overlay"
      tabIndex={0} // Make the div focusable
      onKeyDown={(event) => {
        if (event.key === "Escape") setShowBuilder(false)
      }}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseUp={handleMouseUp}>
      <div className="floating-dialog flex-column"
        ref={dialogRef}
        style={{ left: `${dialogPosition[0]}px`, top: `${dialogPosition[1]}px`,
          width: "70%", maxWidth: "600px", maxHeight: "90vh",
          overflowX: "hidden", overflowY: "auto", resize: "both",
          minWidth: "400px", minHeight: "300px" }}>
        <div className="flex-row-space-between" style={{ marginLeft: "10px", marginRight: "10px" }}
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={handleMouseUp}>
          <div className="dialog-title" style={{ padding: 0, paddingTop: "6px" }}>{t("linkBuilder.title")}</div>
          <button className="push-button"
            type="button"
            onClick={() => setShowBuilder(false)}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
          </button>
        </div>
        <div className="horiz-rule"></div>

        <div style={{margin: "10px"}}>
          <TabBase>
            <Tab title={t("machine.configuration")}>{emulatorGeneralSettings}<div className="horiz-rule" style={{ marginTop: "15px" }}/>{slotConfiguration}</Tab>
            <Tab title={t("linkBuilder.startupOptionsTab")}>{startUpOptions}</Tab>
          </TabBase>
        </div>

        {/* Show final link, readonly textarea for now */}
        <div className="flex-row-space-between" style={{ marginRight: "10px", marginTop: "10px", flexShrink: 0 }}>
          <div className="dialog-title">{t("linkBuilder.finalUrl")}</div>
          <button className="push-button"
            title={t("linkBuilder.copyToClipboard")}
            onClick={() => { navigator.clipboard.writeText(link) }}>
            <FontAwesomeIcon icon={faClipboard} />
          </button>
        </div>
        <textarea
          className="link-builder-textarea"
          style={{ backgroundColor: "var(--input-bg-color)" }}
          rows={8}
          value={link}
          readOnly
        />
        {/* Add text buttons for "Try it", "Clear", and "Close" */}
        <div className="flex-row-space-between" style={{ margin: "10px", flexShrink: 0 }}>
          <button className="push-button text-button"
            onClick={() => { window.open(link, "_blank") }}>
            <span className="centered-title">{t("linkBuilder.tryIt")}</span>
          </button>
          <button className="push-button text-button"
            onClick={resetAllSettings}>
            <span className="centered-title">{t("dialog.reset")}</span>
          </button>
          <button className="push-button text-button"
            onClick={() => { setShowBuilder(false) }}>
            <span className="centered-title">{t("dialog.close")}</span>
          </button>
        </div>
      </div>
    </div>

  return (
    <div>
      {showBuilder && builderDialog}
      <button className="push-button"
        title={t("linkBuilder.buttonTitle")}
        onClick={() => {
          retrieveFromEmulatorSettings()
          setShowBuilder(true)
        }}>
        <FontAwesomeIcon icon={faLink} />
      </button>
    </div>
  )
}

export default LinkBuilder