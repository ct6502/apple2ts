import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink, faXmark, faClipboard } from "@fortawesome/free-solid-svg-icons"
import EditField from "../panels/editfield"
import { Droplist } from "../panels/droplist"
import { diskImages } from "../devices/disk/diskimages"
import CheckBox from "../panels/checkbox"
import { getLowercaseMode, getColorMode, getCrtDistortion, getGhosting, getShowScanlines, getTheme, isEmbedMode, isGameMode } from "../ui_settings"
import { UI_THEME } from "../../common/utility"
import { isAudioEnabled } from "../devices/audio/speaker"
import { handleGetIsDebugging, handleGetMachineName, handleGetMemSize, handleGetProdosFloppy, handleGetSpeedMode } from "../main2worker"
import { useTranslation } from "../../i18n/useTranslation"

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
  const [prodosFloppy, setProdosFloppy] = useState(false)
  const [ramdisk, setRamdisk] = useState("")
  const [scanlines, setScanlines] = useState(false)
  const [selectedDisk, setSelectedDisk] = useState("")
  const [speed, setSpeed] = useState("")
  const [theme, setTheme] = useState("")
  const [tabSection, setTabSection] = useState(TAB.DISK)

  const machineValues = [
    t("linkBuilder.machines.enhanced"),
    t("linkBuilder.machines.unenhanced"),
    t("linkBuilder.machines.apple2p")
  ]

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
    t("linkBuilder.themes.minimal")
  ]
  const themeParams = ["classic", "dark", "minimal"]

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

    if (prodosFloppy) {
      params.push("prodosfloppy=on")
    }

    const ramIndex = ramdiskValues.indexOf(ramdisk)
    if (ramIndex > 0) {
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
    setProdosFloppy(false)
    setRamdisk(ramdiskValues[0])
    setScanlines(false)
    setSelectedDisk("")
    setSpeed(speedNames[2])
    setTheme(themeValues[0])
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
    setProdosFloppy(handleGetProdosFloppy())
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
    setTheme(mytheme === UI_THEME.CLASSIC ? themeValues[0] : mytheme === UI_THEME.DARK ? themeValues[1] : themeValues[2])
    
    if (isEmbedMode()) {
      setAppmode(gameModes[2])
    } else if (isGameMode()) {
      setAppmode(gameModes[1])
    } else {
      setAppmode(gameModes[0])
    }
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
          style={{ left: "35%", top: "10%", width: "70%", maxWidth: "600px" }}>
        <div className="flex-row-space-between" style={{ marginLeft: "10px", marginRight: "10px" }}>
          <div className="dialog-title" style={{padding: 0, paddingTop: "6px"}}>{t("linkBuilder.title")}</div>
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
              setValue={setMachine} />

            <Droplist name={t("linkBuilder.colorMode")}
              value={colormode}
              values={colorNames}
              setValue={setColormode} />

            <Droplist name={t("linkBuilder.ramDiskSize")}
              value={ramdisk}
              values={ramdiskValues}
              setValue={setRamdisk} />

            <Droplist name={t("linkBuilder.emulatorSpeed")}
              value={speed !== "" ? speed : speedNames[2]}
              values={speedNames}
              setValue={setSpeed} />

            <Droplist name={t("linkBuilder.uiTheme")}
              value={theme !== "" ? theme : themeValues[0]}
              values={themeValues}
              setValue={setTheme} />
          </div>
          <div className="flex-column" style={{marginLeft: "20px"}}>
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
              setChecked={(on: boolean) => {setLowercaseMode(!on)}} />
            <CheckBox name={t("linkBuilder.showDebugTab")}
              checked={debug}
              setChecked={setDebug} />
            <CheckBox name={t("config.prodosFloppy")}
              checked={prodosFloppy}
              setChecked={setProdosFloppy} />
            <CheckBox name={t("linkBuilder.sound")}
              checked={!soundoff}
              setChecked={(on: boolean) => {setSoundoff(!on)}} />
          </div>
        </div>

        <div className="horiz-rule" style={{marginTop: "15px"}}></div>

        <div className="flex-row" style={{marginBottom: "15px"}}>
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
          <div style={{minHeight: "150px"}}>
            <Droplist name={t("linkBuilder.diskImageToLoad")}
              value={selectedDisk}
              values={diskNames}
              setValue={setSelectedDisk} />

            <div className="dialog-title">{t("linkBuilder.customDiskUrl")}</div>

            <div style={{marginLeft: "10px", marginRight: "10px"}}>
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
          <div style={{minHeight: "150px"}}>
            <textarea
              className="link-builder-textarea"
              value={textBlock}
              rows={5}
              onChange={(e) => setTextBlock(e.target.value)}
              placeholder={t("linkBuilder.enterTextPlaceholder")}
            />
            <CheckBox name={t("linkBuilder.runBasicAfterLoading")}
              checked={!runprogoff}
              setChecked={(on: boolean) => {setRunprogoff(!on)}} />
          </div>
        }

        {tabSection === TAB.HEX &&
          <div style={{minHeight: "150px"}}>
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
              setChecked={(on: boolean) => {setRunprogoff(!on)}} />
          </div>
        }


        <div className="horiz-rule" style={{marginTop: "20px"}}></div>

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
          style={{backgroundColor: "var(--input-bg-color)"}}
          rows={5}
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