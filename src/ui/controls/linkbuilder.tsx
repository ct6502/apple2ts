import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink, faXmark, faClipboard } from "@fortawesome/free-solid-svg-icons"
import EditField from "../panels/editfield"
import { Droplist } from "../panels/droplist"
import { diskImages } from "../devices/disk/diskimages"
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
  const [fragmentURL, setFragmentURL] = useState("")
  const [ghosting, setGhosting] = useState(false)
  const [hexAddress, setHexAddress] = useState("")
  const [textBlock, setTextBlock] = useState("")
  const [loadBlock, setLoadBlock] = useState("")
  const [hexBlock, setHexBlock] = useState("")
  const [machine, setMachine] = useState("")
  const [ramdisk, setRamdisk] = useState("")
  const [scanlines, setScanlines] = useState(false)
  const [selectedDisk, setSelectedDisk] = useState("")
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

  const diskNames = [t("linkBuilder.customDiskUrlOption"), ...diskImages.map(disk => disk.title).sort()]
  const isCustomURL = selectedDisk === "" || selectedDisk === t("linkBuilder.customDiskUrlOption")

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

    for (let i = 0; i < params.length; i++) {
      link += (i === 0 ? "?" : "&") + params[i]
    }
    if (isCustomURL) {
      if (fragmentURL) {
        link += `#${fragmentURL}`
      }
    } else if (selectedDisk) {
      const disk = diskImages.find(d => d.title === selectedDisk)
      if (disk) {
        // Remove all whitespace from the name
        link += `#${selectedDisk.replace(/\s+/g, "")}`
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
              <div>
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