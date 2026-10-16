import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink, faXmark, faClipboard } from "@fortawesome/free-solid-svg-icons"
import EditField from "../panels/editfield"
import { Droplist } from "../panels/droplist"
import { diskImages } from "../devices/disk/diskimages"
import { newReleases } from "../devices/disk/newreleases"
import CheckBox from "../panels/checkbox"
import { getLowercaseMode, getColorMode, getCrtDistortion, getGhosting, getShowScanlines, getTheme, isEmbedMode, isGameMode } from "../ui_settings"
import { DEFAULT_SLOT_CONFIG, UI_THEMES } from "../../common/utility"
import { isAudioEnabled } from "../devices/audio/speaker"
import { handleGetIsDebugging, handleGetMachineName, handleGetMemSize, handleGetSpeedMode, handleGetSlotConfig } from "../main2worker"
import { useTranslation } from "../../i18n/useTranslation"
import { SLOT_NUMBERS, getSlotOptions } from "../devices/machineconfig"

export enum TAB {
  DISK,
  TEXT,
  HEX,
}

const LinkBuilder = () => {
  const { t } = useTranslation()
  const [showBuilder, setShowBuilder] = useState(false)

  const colorNames = [
    t("linkBuilder.colorNames.color"),
    t("linkBuilder.colorNames.nofringe"),
    t("linkBuilder.colorNames.green"),
    t("linkBuilder.colorNames.amber"),
    t("linkBuilder.colorNames.white"),
    t("linkBuilder.colorNames.inverse")
  ]
  const colorModes = ["color", "nofringe", "green", "amber", "white", "inverse"]

  const speedNames = [
    t("linkBuilder.speedNames.snail"),
    t("linkBuilder.speedNames.slow"),
    t("linkBuilder.speedNames.normal"),
    t("linkBuilder.speedNames.two"),
    t("linkBuilder.speedNames.three"),
    t("linkBuilder.speedNames.four"),
    t("linkBuilder.speedNames.warp")
  ]
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

  const [colormode, setColormode] = useState("")
  const [crtdistort, setCrtdistort] = useState(false)
  const [debug, setDebug] = useState(false)
  const [selectedDisk, setSelectedDisk] = useState("")
  const [fragmentURL, setFragmentURL] = useState("")
  const [s6d1Disk, setS6d1Disk] = useState("")
  const [s6d1Url, setS6d1Url] = useState("")
  const [s6d2Disk, setS6d2Disk] = useState("")
  const [s6d2Url, setS6d2Url] = useState("")
  const [s7d1Disk, setS7d1Disk] = useState("")
  const [s7d1Url, setS7d1Url] = useState("")
  const [s7d2Disk, setS7d2Disk] = useState("")
  const [s7d2Url, setS7d2Url] = useState("")
  const [s2d1Disk, setS2d1Disk] = useState("")
  const [s2d1Url, setS2d1Url] = useState("")
  const [s4d1Disk, setS4d1Disk] = useState("")
  const [s4d1Url, setS4d1Url] = useState("")
  const [ghosting, setGhosting] = useState(false)
  const [hexAddress, setHexAddress] = useState("")
  const [textBlock, setTextBlock] = useState("")
  const [loadBlock, setLoadBlock] = useState("")
  const [hexBlock, setHexBlock] = useState("")
  const [machine, setMachine] = useState("")
  const [ramdisk, setRamdisk] = useState("")
  const [scanlines, setScanlines] = useState(false)
  const [speed, setSpeed] = useState("")
  const [theme, setTheme] = useState("")
  const [tabSection, setTabSection] = useState(TAB.DISK)
  const [slotConfig, setSlotConfig] = useState<SlotConfig>({ ...DEFAULT_SLOT_CONFIG })

  // Short display labels for cards in the Link Builder slot dropdowns
  const cardShortLabels: Record<SLOT_CARD_ID, string> = {
    none: t("linkBuilder.slots.cardNone"),
    ssc: "SSC",
    softcard: "SoftCard (Z80)",
    aux: "Aux/80Col",
    videoterm: "VideoTerm",
    vidhd: "VidHD",
    mockingboard: "Mockingboard",
    mouse: "Mouse",
    vera: "VERA",
    passport: "Passport",
    disk2: "Disk II",
    smartport: "SmartPort",
  }

  const machineValues = [
    t("linkBuilder.machines.enhanced"),
    t("linkBuilder.machines.unenhanced"),
    t("linkBuilder.machines.apple2p")
  ]
  // Derive MACHINE_NAME from local machine state so slot options stay in sync
  const lbMachineName: MACHINE_NAME = machine === machineValues[2] ? "APPLE2P"
    : machine === machineValues[1] ? "APPLE2EU" : "APPLE2EE"

  const ramdiskValues = [
    t("linkBuilder.ramDiskSizes.default"),
    t("linkBuilder.ramDiskSizes.512"),
    t("linkBuilder.ramDiskSizes.1024"),
    t("linkBuilder.ramDiskSizes.4096"),
    t("linkBuilder.ramDiskSizes.8192")
  ]
  const ramdiskParams = ["64", "512", "1024", "4096", "8192"]

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
    let link = `${window.location.origin}`
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

    const machineIndex = machineValues.indexOf(machine)
    if (machineIndex === 1) { // unenhanced
      params.push("machine=apple2eu")
    } else if (machineIndex === 2) { // II+
      params.push("machine=apple2p")
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

    const speedIndex = speedNames.indexOf(speed)
    if (speedIndex !== -1 && speedIndex !== 2) { // 2 is "1 MHz (default)"
      params.push(`speed=${speedParams[speedIndex]}`)
    }

    const themeIndex = themeValues.indexOf(theme)
    if (themeIndex > 0) {
      params.push(`theme=${themeParams[themeIndex]}`)
    }

    // Slot configuration params: emit slotN=card for any non-default slot
    let hasVera = false
    SLOT_NUMBERS.forEach(slot => {
      const card = slotConfig[slot]
      if (card !== DEFAULT_SLOT_CONFIG[slot]) {
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
        { key: "s6d1", disk: s6d1Disk, url: s6d1Url, enabled: slotConfig[6] === "disk2" },
        { key: "s6d2", disk: s6d2Disk, url: s6d2Url, enabled: slotConfig[6] === "disk2" },
        { key: "s7d1", disk: s7d1Disk, url: s7d1Url, enabled: slotConfig[7] === "smartport" },
        { key: "s7d2", disk: s7d2Disk, url: s7d2Url, enabled: slotConfig[7] === "smartport" },
        { key: "s2d1", disk: s2d1Disk, url: s2d1Url, enabled: slotConfig[2] === "vera" },
        { key: "s4d1", disk: s4d1Disk, url: s4d1Url, enabled: slotConfig[4] === "vera" },
      ]

      for (const drive of drives) {
        if (!drive.enabled) continue
        if (drive.disk === customUrlOption) {
          if (drive.url.trim() !== "") {
            params.push(`${drive.key}=${encodeURIComponent(drive.url.trim())}`)
          }
        } else if (drive.disk && drive.disk !== noneOption) {
          params.push(`${drive.key}=${encodeURIComponent(drive.disk.replace(/\s+/g, ""))}`)
        }
      }
    }

    for (let i = 0; i < params.length; i++) {
      link += (i === 0 ? "?" : "&") + params[i]
    }

    if (tabSection === TAB.DISK) {
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
    setColormode(colorNames[0])
    setCrtdistort(false)
    setDebug(false)
    setGhosting(false)
    setHexAddress("")
    setTextBlock("")
    setLoadBlock("")
    setHexBlock("")
    setMachine(machineValues[0])
    setRamdisk(ramdiskValues[0])
    setScanlines(false)
    setSelectedDisk("")
    setFragmentURL("")
    setS6d1Disk("")
    setS6d1Url("")
    setS6d2Disk("")
    setS6d2Url("")
    setS7d1Disk("")
    setS7d1Url("")
    setS7d2Disk("")
    setS7d2Url("")
    setS2d1Disk("")
    setS2d1Url("")
    setS4d1Disk("")
    setS4d1Url("")
    setSpeed(speedNames[2])
    setTheme(themeValues[0])
    setSlotConfig({ ...DEFAULT_SLOT_CONFIG })
  }

  const retrieveFromEmulatorSettings = () => {
    // Retrieve all of the emulator settings from their individual local
    // local storage keys or from the emulator state and populate the fields in the link builder
    setColormode(colorNames[getColorMode()])
    setCrtdistort(getCrtDistortion())
    setGhosting(getGhosting())
    setScanlines(getShowScanlines())
    setLowercaseMode(getLowercaseMode())
    setDebug(handleGetIsDebugging())
    setSoundoff(!isAudioEnabled())
    setTextBlock("")
    setHexBlock("")
    setHexAddress("")

    const machineName = handleGetMachineName()
    setMachine(machineName === "APPLE2P" ? machineValues[2] :
      machineName === "APPLE2EU" ? machineValues[1] : machineValues[0])

    const mem = handleGetMemSize()
    const memIndex = mem > 8000 ? 4 : mem > 4000 ? 3 : mem > 1000 ? 2 : mem > 500 ? 1 : 0
    setRamdisk(ramdiskValues[memIndex])

    const currentSpeed = handleGetSpeedMode()
    if (currentSpeed >= -2 && currentSpeed <= 4) {
      setSpeed(speedNames[currentSpeed + 2])
    } else {
      setSpeed("")
    }

    setSelectedDisk("")
    setFragmentURL("")
    setS6d1Disk("")
    setS6d1Url("")
    setS6d2Disk("")
    setS6d2Url("")
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

  return (
    <div>
      {showBuilder &&
        <div className="modal-overlay"
          tabIndex={0} // Make the div focusable
          onKeyDown={(event) => {
            if (event.key === "Escape") setShowBuilder(false)
          }}>
          <div className="floating-dialog flex-column"
            style={{ left: "35%", top: "5%", width: "70%", maxWidth: "600px", maxHeight: "90vh", overflowX: "hidden", overflowY: "auto" }}>
            <div className="flex-row-space-between" style={{ marginLeft: "10px", marginRight: "10px" }}>
              <div className="dialog-title" style={{ padding: 0, paddingTop: "6px" }}>{t("linkBuilder.title")}</div>
              <button className="push-button"
                type="button"
                onClick={() => setShowBuilder(false)}>
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
              </button>
            </div>
            <div className="horiz-rule"></div>

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
                    setMachine(val)
                    // Adjust slot 3 when crossing between II+ and IIe families
                    const newIsIIp = val === machineValues[2]
                    const wasIIp = lbMachineName === "APPLE2P"
                    if (newIsIIp !== wasIIp) {
                      setSlotConfig(prev => ({
                        ...prev,
                        3: newIsIIp ? "videoterm" : "aux"
                      }))
                      if (!newIsIIp) setRamdisk(ramdiskValues[0]) // reset to 64KB default
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
                    if (rIdx > 0 && lbMachineName !== "APPLE2P" && slotConfig[3] !== "aux") {
                      setSlotConfig(prev => ({ ...prev, 3: "aux" }))
                    }
                  }} />

                <Droplist name={t("linkBuilder.emulatorSpeed")}
                  value={speed !== "" ? speed : speedNames[2]}
                  values={speedNames}
                  setValue={setSpeed} />

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
              </div>
            </div>

            <div className="horiz-rule" style={{ marginTop: "15px" }}></div>

            {/* Slot Configuration – always visible */}
            <div className="dialog-title" style={{ marginBottom: "4px" }}>{t("linkBuilder.slots.configure")}</div>
            <div className="flex-row" style={{ flexWrap: "wrap", gap: "0 20px", marginBottom: "8px" }}>
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
                    return `AE RamWorks (${sizeStr})`
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
                    : `AE RamWorks (${ramSizeKb >= 1024 ? `${ramSizeKb / 1024}MB` : `${ramSizeKb}KB`})`
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

            <div className="horiz-rule" style={{ marginTop: "15px" }}></div>

            <div className="flex-row" style={{ marginBottom: "15px" }}>
              <div className="dialog-title">{t("linkBuilder.onStartup")}</div>
              <input type="radio"
                id="Address"
                name="breakAt"
                value="address"
                autoComplete="off"
                className="check-radio-box"
                checked={tabSection === TAB.DISK}
                onChange={() => { setTabSection(TAB.DISK) }} />
              <label htmlFor="Address" className="dialog-title flush-left">{t("linkBuilder.loadDiskImage")}</label>
              <input type="radio"
                id="Watchpoint"
                name="watch"
                value="watchpoint"
                autoComplete="off"
                className="check-radio-box"
                checked={tabSection === TAB.TEXT}
                onChange={() => { setTabSection(TAB.TEXT) }} />
              <label htmlFor="Watchpoint" className="dialog-title flush-left">{t("linkBuilder.loadBasicProgram")}</label>
              <input type="radio"
                id="Instruction"
                name="instruction"
                value="instruction"
                autoComplete="off"
                className="check-radio-box"
                checked={tabSection === TAB.HEX}
                onChange={() => { setTabSection(TAB.HEX) }} />
              <label htmlFor="Instruction" className="dialog-title flush-left">{t("linkBuilder.loadHexCode")}</label>
            </div>

            {tabSection === TAB.DISK &&
              <div className="flex-column" style={{ gap: "6px" }}>
                <Droplist name={t("linkBuilder.diskImageToLoad")}
                  value={selectedDisk}
                  values={diskNames}
                  setValue={setSelectedDisk} />

                <div className="dialog-title">{t("linkBuilder.customDiskUrl")}</div>

                <div style={{ marginLeft: "10px", marginRight: "10px" }}>
                  <EditField
                    value={fragmentURL}
                    setValue={setFragmentURL}
                    disabled={!isCustomURL}
                    placeholder="http://example.com/disk.dsk" />
                </div>

                <div className="dialog-title" style={{ marginTop: "12px", marginBottom: "4px" }}>
                  Additional Disk Drives
                </div>

                {slotConfig[6] === "disk2" && (
                  <>
                    <Droplist
                      name="Slot 6 Drive 1 (Floppy 1)"
                      value={s6d1Disk || noneOption}
                      values={diskOptionsWithNone}
                      setValue={setS6d1Disk} />
                    {s6d1Disk === customUrlOption && (
                      <div style={{ marginLeft: "10px", marginRight: "10px", marginBottom: "4px" }}>
                        <EditField
                          value={s6d1Url}
                          setValue={setS6d1Url}
                          placeholder="http://example.com/floppy1.dsk" />
                      </div>
                    )}

                    <Droplist
                      name="Slot 6 Drive 2 (Floppy 2)"
                      value={s6d2Disk || noneOption}
                      values={diskOptionsWithNone}
                      setValue={setS6d2Disk} />
                    {s6d2Disk === customUrlOption && (
                      <div style={{ marginLeft: "10px", marginRight: "10px", marginBottom: "4px" }}>
                        <EditField
                          value={s6d2Url}
                          setValue={setS6d2Url}
                          placeholder="http://example.com/floppy2.dsk" />
                      </div>
                    )}
                  </>
                )}

                {slotConfig[7] === "smartport" && (
                  <>
                    <Droplist
                      name="Slot 7 Drive 1 (Hard Drive 1)"
                      value={s7d1Disk || noneOption}
                      values={diskOptionsWithNone}
                      setValue={setS7d1Disk} />
                    {s7d1Disk === customUrlOption && (
                      <div style={{ marginLeft: "10px", marginRight: "10px", marginBottom: "4px" }}>
                        <EditField
                          value={s7d1Url}
                          setValue={setS7d1Url}
                          placeholder="http://example.com/hd1.hdv" />
                      </div>
                    )}

                    <Droplist
                      name="Slot 7 Drive 2 (Hard Drive 2)"
                      value={s7d2Disk || noneOption}
                      values={diskOptionsWithNone}
                      setValue={setS7d2Disk} />
                    {s7d2Disk === customUrlOption && (
                      <div style={{ marginLeft: "10px", marginRight: "10px", marginBottom: "4px" }}>
                        <EditField
                          value={s7d2Url}
                          setValue={setS7d2Url}
                          placeholder="http://example.com/hd2.hdv" />
                      </div>
                    )}
                  </>
                )}

                {slotConfig[2] === "vera" && (
                  <div>
                    <Droplist
                      name="Slot 2 Drive 1 (VERA SD)"
                      value={s2d1Disk || noneOption}
                      values={diskOptionsWithNone}
                      setValue={setS2d1Disk} />
                    {s2d1Disk === customUrlOption && (
                      <div style={{ marginLeft: "10px", marginRight: "10px", marginBottom: "4px" }}>
                        <EditField
                          value={s2d1Url}
                          setValue={setS2d1Url}
                          placeholder="http://example.com/sd.img" />
                      </div>
                    )}
                  </div>
                )}

                {slotConfig[4] === "vera" && (
                  <div>
                    <Droplist
                      name="Slot 4 Drive 1 (VERA SD)"
                      value={s4d1Disk || noneOption}
                      values={diskOptionsWithNone}
                      setValue={setS4d1Disk} />
                    {s4d1Disk === customUrlOption && (
                      <div style={{ marginLeft: "10px", marginRight: "10px", marginBottom: "4px" }}>
                        <EditField
                          value={s4d1Url}
                          setValue={setS4d1Url}
                          placeholder="http://example.com/sd.img" />
                      </div>
                    )}
                  </div>
                )}

                <EditField name={t("linkBuilder.textToType")}
                  value={loadBlock}
                  setValue={setLoadBlock}
                  placeholder="CHOP"
                  width="15em" />
              </div>
            }

            {tabSection === TAB.TEXT &&
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
            }

            {tabSection === TAB.HEX &&
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
            }
            <div className="horiz-rule" style={{ marginTop: "10px" }}></div>

            {/* Show final link, readonly textarea for now */}
            <div className="flex-row-space-between" style={{ marginRight: "10px" }}>
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
            <div className="flex-row-space-between" style={{ margin: "10px" }}>
              <button className="push-button text-button"
                onClick={() => { window.open(link, "_blank") }}>
                <span className="centered-title">{t("linkBuilder.tryIt")}</span>
              </button>
              <button className="push-button text-button"
                onClick={resetAllSettings}>
                <span className="centered-title">{t("linkBuilder.reset")}</span>
              </button>
              <button className="push-button text-button"
                onClick={() => { setShowBuilder(false) }}>
                <span className="centered-title">{t("linkBuilder.close")}</span>
              </button>
            </div>

          </div>
        </div>
      }

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