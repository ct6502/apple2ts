import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLink, faXmark, faClipboard } from "@fortawesome/free-solid-svg-icons"
import EditField from "../panels/editfield"
import { Droplist } from "../panels/droplist"
import { diskImages } from "../devices/disk/diskimages"

const LinkBuilder = () => {
  const [showBuilder, setShowBuilder] = useState(false)

  const [hexAddress, setHexAddress] = useState("")
  const [hexCode, setHexCode] = useState("")
  const [fragmentURL, setFragmentURL] = useState("")
  const [selectedDisk, setSelectedDisk] = useState("custom")

  const isCustomURL = selectedDisk.toLowerCase().includes("custom")

  // When fragmentURL changes, generate the link
  const generateLink = () => {
    let link = `${window.location.origin}`
    if (hexCode) {
      link += `?hex=${encodeURIComponent(hexCode.replace(/\s+/g, ""))}`
    }
    if (hexAddress) {
      link += `&address=${encodeURIComponent(hexAddress)}`
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
  }, [fragmentURL, selectedDisk, hexCode, hexAddress])

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
          style={{ left: "35%", top: "25%", width: "70%", maxWidth: "600px" }}>
        <div className="flex-row-space-between" style={{ marginLeft: "10px", marginRight: "10px" }}>
          <div className="dialog-title" style={{padding: 0, paddingTop: "6px"}}>Link Builder</div>
          <button className="push-button"
            type="button"
            onClick={() => setShowBuilder(false)}>
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
          </button>
        </div>
        <div className="horiz-rule"></div>

        <textarea
          style={{ margin: "10px", marginBottom: "0px", fontFamily: "monospace" }}
          className="link-builder-textarea"
          value={hexCode}
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

{/*

<b>Optional URL Parameters</b>
appmode=game|embed
capslock=off
color=color|nofringe|green|amber|white|inverse
crtdistort=on|off
debug=on
ghosting=on|off
machine=apple2p|apple2eu|apple2ee (II+, IIe, IIe enh)
ramdisk=64|512|1024|4096|8192
run=false (do not run Hex or BASIC program)
scanlines=on|off
sound=off
speed=snail|slow|normal|two|three|fast|warp
theme=classic|dark|minimal

*/}


        {/* Custom URL text box */}
        <div className="flex-row">
          <Droplist name="Disk Image: "
            value={selectedDisk}
            values={diskNames}
            setValue={setSelectedDisk} />
        </div>

        <div className="flex-row">
          <EditField name="Disk Image URL: "
            value={fragmentURL}
            setValue={setFragmentURL}
            disabled={!isCustomURL}
            placeholder="http://example.com/disk.dsk"
            width="30em" />
        </div>

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
          style={{ margin: "10px", marginTop: "0px", fontFamily: "monospace" }}
          className="link-builder-textarea"
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