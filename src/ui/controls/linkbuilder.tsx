import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink, faXmark, faClipboard } from "@fortawesome/free-solid-svg-icons"
import EditField from "../panels/editfield"
import { Droplist } from "../panels/droplist"
import { diskImages } from "../devices/disk/diskimages"
import CheckBox from "../panels/checkbox"
import { getCapsLock, getColorMode, getCrtDistortion, getGhosting, getShowScanlines, getTheme, isEmbedMode, isGameMode } from "../ui_settings"
import { UI_THEME } from "../../common/utility"
import { isAudioEnabled } from "../devices/audio/speaker"
import { handleGetIsDebugging, handleGetMachineName, handleGetMemSize, handleGetSpeedMode } from "../main2worker"

const LinkBuilder = () => {
  const [showBuilder, setShowBuilder] = useState(true)

  const colorNames = ["Color", "Color (no fringing)", "Green Screen", "Amber Screen", "White Screen", "Inverse White"]
  const colorModes = ["color", "nofringe", "green", "amber", "white", "inverse"]
  const speedNames = ["Snail", "Slow", "1 MHz (default)", "2 MHz", "3 MHz", "4 MHz", "Warp"]
  const gameModes = ["Normal", "Game (no drives or tabs)", "Embed (hide all controls)"]
  const [appmode, setAppmode] = useState("")

  // Reverse the logic for these so the default is false and the checkbox is on,
  // but the URL parameter is "xyz=off/false" when it's true
  const [capslockoff, setCapslockoff] = useState(false)
  const [runprogoff, setRunprogoff] = useState(false)
  const [soundoff, setSoundoff] = useState(false)

  const [colormode, setColormode] = useState("")
  const [crtdistort, setCrtdistort] = useState(false)
  const [debug, setDebug] = useState(false)
  const [fragmentURL, setFragmentURL] = useState("")
  const [ghosting, setGhosting] = useState(false)
  const [hexAddress, setHexAddress] = useState("")
  const [textBlock, setTextBlock] = useState("")
  const [machine, setMachine] = useState("")
  const [ramdisk, setRamdisk] = useState("64")
  const [scanlines, setScanlines] = useState(false)
  const [selectedDisk, setSelectedDisk] = useState("")
  const [speed, setSpeed] = useState("")
  const [theme, setTheme] = useState("")
  const [isHex, setIsHex] = useState(false)

  const isCustomURL = selectedDisk === "" || selectedDisk.toLowerCase().includes("custom")

  // When fragmentURL changes, generate the link
  const generateLink = () => {
    let link = `${window.location.origin}`
    const params = []
    if (appmode.length > 0 && appmode !== "Normal") {
      params.push(`appmode=${appmode.split(" ")[0]}`)
    }
    if (capslockoff) {
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
    if (textBlock) {
      if (isHex) {
        const txt = encodeURIComponent(textBlock.replace(/\s+/g, ""))
        params.push(`hex=${txt}`)
      } else {
        // We need to url-encode the textBlock, keeping all whitespace
        // and special characters and converting them to URL-safe
        const txt = encodeURIComponent(textBlock)
        params.push(`${isHex ? "hex" : "text"}=${txt}`)
      }
    }
    if (hexAddress) {
      params.push(`address=${encodeURIComponent(hexAddress)}`)
    }
    if (machine.toLowerCase().includes("unenhanced")) {
      params.push("machine=apple2eu")
    } else if (machine.includes("II+")) {
      params.push("machine=apple2p")
    }
    if (ramdisk !== "" && !ramdisk.startsWith("64")) {
      params.push("ramdisk=" + ramdisk)
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
    if (speed !== "" && !speed.startsWith("1")) {
      let speedParam = speed.toLowerCase()
      if (speedParam.startsWith("2")) {
        speedParam = "two"
      } else if (speedParam.startsWith("3")) {
        speedParam = "three"
      } else if (speedParam.startsWith("4")) {
        speedParam = "fast"
      }
      params.push(`speed=${speedParam}`)
    }
    if (theme !== "" && !theme.toLowerCase().startsWith("classic")) {
      params.push(`theme=${theme.toLowerCase()}`)
    }

    for (let i = 0; i < params.length; i++) {
      link += (i === 0 ? "?" : "&") + params[i]
    }
    if (isCustomURL) {
      if (fragmentURL) {
        const encodedURL = encodeURIComponent(fragmentURL)
        link += `#${encodedURL}`
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

  const [link, setLink] = useState(generateLink())

  useEffect(() => {
    setLink(generateLink())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appmode, capslockoff, colormode, crtdistort, debug, ghosting, fragmentURL,
    textBlock, hexAddress, isHex, machine, ramdisk, runprogoff, scanlines, selectedDisk, soundoff, speed, theme])

  // put custom url at the front of the list, then all the disk images sorted alphabetically
  const diskNames = ["Custom URL", ...diskImages.map(disk => disk.title).sort()]

  const testKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isHex) {
      return
    }
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

  const retrieveFromEmulatorSettings = () => {
    // Retrieve all of the emulator settings from their individual local
    // local storage keys or from the emulator state and populate the fields in the link builder
    setColormode(colorNames[getColorMode()])
    setCrtdistort(getCrtDistortion())
    setGhosting(getGhosting())
    setScanlines(getShowScanlines())
    setCapslockoff(!getCapsLock())
    setDebug(handleGetIsDebugging())
    setSoundoff(!isAudioEnabled())
    setTextBlock("")
    setHexAddress("")
    setIsHex(false)
    const machineName = handleGetMachineName()
    setMachine(machineName === "APPLE2P" ? "Apple II+" :
      machineName === "APPLE2EU" ? "Apple IIe unenhanced" : "Apple IIe enhanced")
    const mem = handleGetMemSize()
    setRamdisk(mem > 8000 ? "8192" : mem > 4000 ? "4096" : mem > 1000 ? "1024" : mem > 500 ? "512" : "64")
    const currentSpeed = handleGetSpeedMode()
    if (currentSpeed >= -2 && currentSpeed <= 4) {
      setSpeed(speedNames[currentSpeed + 2])
    } else {
      setSpeed("")
    }
    setSelectedDisk("")
    const mytheme = getTheme()
    setTheme(mytheme === UI_THEME.CLASSIC ? "Classic" : mytheme === UI_THEME.DARK ? "Dark" : "Minimal")
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
          style={{ left: "3.5%", top: "10%", width: "70%", maxWidth: "600px" }}>
        <div className="flex-row-space-between" style={{ marginLeft: "10px", marginRight: "10px" }}>
          <div className="dialog-title" style={{padding: 0, paddingTop: "6px"}}>Link Builder</div>
          <button className="push-button"
            type="button"
            onClick={() => setShowBuilder(false)}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
          </button>
        </div>
        <div className="horiz-rule"></div>

        <div className="flex-row">
          <div className="flex-column">
            <Droplist name="User interface: "
              value={appmode}
              values={gameModes}
              setValue={setAppmode} />

            <Droplist name="Machine: "
              value={machine}
              values={["Apple IIe enhanced", "Apple IIe unenhanced", "Apple II+"]}
              setValue={setMachine} />

            <Droplist name="Color mode: "
              value={colormode}
              values={colorNames}
              setValue={setColormode} />

            <Droplist name="Size of RAM disk (kb): "
              value={ramdisk}
              values={["64 (default)", "512", "1024", "4096", "8192"]}
              setValue={setRamdisk} />

            <Droplist name="Speed of emulator: "
              value={speed !== "" ? speed : "1 MHz (default)"}
              values={speedNames}
              setValue={setSpeed} />

            <Droplist name="User Interface Theme: "
              value={theme !== "" ? theme : "Classic"}
              values={["Classic", "Dark", "Minimal"]}
              setValue={setTheme} />
          </div>
          <div className="flex-column" style={{marginLeft: "20px"}}>
            <CheckBox name="CRT Distortion"
              checked={crtdistort}
              setChecked={setCrtdistort} />
            <CheckBox name="CRT Ghosting"
              checked={ghosting}
              setChecked={setGhosting} />
            <CheckBox name="CRT Scanlines"
              checked={scanlines}
              setChecked={setScanlines} />
            <CheckBox name="Capslock"
              checked={!capslockoff}
              setChecked={(on: boolean) => {setCapslockoff(!on)}} />
            <CheckBox name="Show debug tab"
              checked={debug}
              setChecked={setDebug} />
            <CheckBox name="Sound"
              checked={!soundoff}
              setChecked={(on: boolean) => {setSoundoff(!on)}} />
          </div>
        </div>

        <div className="horiz-rule" style={{marginTop: "15px"}}></div>

        <Droplist name="Disk image to load on startup: "
          value={selectedDisk}
          values={diskNames}
          setValue={setSelectedDisk} />

        <EditField name="Custom disk image URL: "
          value={fragmentURL}
          setValue={setFragmentURL}
          disabled={!isCustomURL}
          placeholder="http://example.com/disk.dsk"
          width="30em" />

        <div className="horiz-rule" style={{marginTop: "15px"}}></div>

        <div className="flex-row" style={{alignItems: "baseline"}}>
          <CheckBox name="Text or BASIC Code"
            checked={!isHex}
            setChecked={(checked: boolean) => {setIsHex(!checked)}} />
          <CheckBox name="Hexadecimal"
            checked={isHex}
            setChecked={(checked: boolean) => {setIsHex(checked)}} />
          <div style={{padding: "0px", translate: "0 -2px"}}>
          <EditField name={"Hex load address: $"}
            value={hexAddress}
            setValue={setHexAddress}
            disabled={!isHex}
            isHex={true}
            placeholder="0300"
            width="5em" />
            </div>
        </div>

        <textarea
          style={{ marginBottom: "0" }}
          className="link-builder-textarea"
          value={textBlock}
          rows={4}
          onChange={(e) => setTextBlock(e.target.value)}
          onKeyDown={testKey}
          placeholder={isHex ? "Enter hexadecimal code here, e.g. A9 01 8D 00 03" : "Enter Text or BASIC code here"}
        />
        <CheckBox name="Run BASIC or Hex program after loading"
          checked={!runprogoff}
          setChecked={(on: boolean) => {setRunprogoff(!on)}} />

        <div className="horiz-rule" style={{marginTop: "10px"}}></div>

        {/* Show final link, readonly textarea for now */}
        <div className="flex-row-space-between" style={{ marginRight: "10px" }}>
          <div className="dialog-title">Final URL:</div>
          <button className="push-button"
            title="Copy to Clipboard"
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
            <span className="centered-title">Try It</span>
          </button>
          <button className="push-button text-button"
            onClick={() => { setFragmentURL("") }}>
            <span className="centered-title">Reset</span>
          </button>
          <button className="push-button text-button"
            onClick={() => { setShowBuilder(false) }}>
            <span className="centered-title">Close</span>
          </button>
        </div>

      </div>
    </div>
    }

    <button className="push-button"
      title="Link Builder"
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