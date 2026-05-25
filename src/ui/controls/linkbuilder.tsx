import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink, faXmark, faClipboard } from "@fortawesome/free-solid-svg-icons"
import EditField from "../panels/editfield"
import { Droplist } from "../panels/droplist"
import { diskImages } from "../devices/disk/diskimages"
import CheckBox from "../panels/checkbox"

const LinkBuilder = () => {
  const [showBuilder, setShowBuilder] = useState(false)

  const colorNames = ["Color", "Color (no fringing)", "Green Screen", "Amber Screen", "White Screen", "Inverse White"]
  const colorModes = ["color", "nofringe", "green", "amber", "white", "inverse"]
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
  const [hexCode, setHexCode] = useState("")
  const [machine, setMachine] = useState("")
  const [ramdisk, setRamdisk] = useState("64")
  const [scanlines, setScanlines] = useState(false)
  const [selectedDisk, setSelectedDisk] = useState("")
  const [speed, setSpeed] = useState("")
  const [theme, setTheme] = useState("")

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
    if (hexCode) {
      params.push(`hex=${encodeURIComponent(hexCode.replace(/\s+/g, ""))}`)
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
    hexCode, hexAddress, machine, ramdisk, runprogoff, scanlines, selectedDisk, soundoff, speed, theme])

  // put custom url at the front of the list, then all the disk images sorted alphabetically
  const diskNames = ["Custom URL", ...diskImages.map(disk => disk.title).sort()]

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
          <div className="dialog-title" style={{padding: 0, paddingTop: "6px"}}>Link Builder</div>
          <button className="push-button"
            type="button"
            onClick={() => setShowBuilder(false)}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
          </button>
        </div>
        <div className="horiz-rule"></div>

        <Droplist name="Application mode: "
          value={appmode}
          values={["Normal", "Game (no drives or tabs)", "Embed (hide all controls)"]}
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
          values={["Snail", "Slow", "1 MHz (default)", "2 MHz", "3 MHz", "4 MHz", "Warp"]}
          setValue={setSpeed} />

        <Droplist name="User Interface Theme: "
          value={theme !== "" ? theme : "Classic"}
          values={["Classic", "Dark", "Minimal"]}
          setValue={setTheme} />


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
        <CheckBox name="Debugging"
          checked={debug}
          setChecked={setDebug} />
        <CheckBox name="Sound"
          checked={!soundoff}
          setChecked={(on: boolean) => {setSoundoff(!on)}} />

        <textarea
          style={{ margin: "10px", marginBottom: "0px", fontFamily: "monospace" }}
          className="link-builder-textarea"
          value={hexCode}
          rows={4}
          onChange={(e) => setHexCode(e.target.value)}
          onKeyDown={testKey}
          placeholder="Enter hexadecimal code here, e.g. A9 01 8D 00 03"
        />
        <EditField name={"Hex Load Address: $"}
          value={hexAddress}
          setValue={setHexAddress}
          isHex={true}
          placeholder="0300"
          width="5em" />

        <CheckBox name="Run Hex or BASIC Program"
          checked={!runprogoff}
          setChecked={(on: boolean) => {setRunprogoff(!on)}} />

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
          style={{ margin: "10px", marginTop: "0px", fontFamily: "monospace"}}
          className="link-builder-textarea"
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
      onClick={() => { setShowBuilder(true) }}>
      <FontAwesomeIcon icon={faLink} />
    </button>
  </div>
)
}

export default LinkBuilder