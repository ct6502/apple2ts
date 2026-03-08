import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import EditField from "../../panels/editfield"
import { getDisassembly, getDisassemblyAddress, getLineAsPlaintext } from "./disassembly_utilities"
import { toHex } from "../../../common/utility"
import { handleGetState6502 } from "../../main2worker"

const SaveDisassemblyDialog = (props:
  {
    onClose: () => void,
  }) => {
  const [includeLabels, setIncludeLabels] = useState(true)
  const [includeSeparator, setIncludeSeparator] = useState(true)
  const [startAddress, setStartAddress] = useState(() => {
    let value = getDisassemblyAddress()
    if (value === -1) value = handleGetState6502().PC
    return toHex(value)
  })
  const [endAddress, setEndAddress] = useState(() => {
    const value = Math.min(parseInt(startAddress, 16) + 0x400, 0xFFFF)
    return toHex(value)
  })

  const handleSetStartAddress = (value: string) => {
    const newValue = value.toUpperCase()
    if (newValue.match(/^([A-F0-9]{0,4})$/)) {
      setStartAddress(newValue)
    } else {
      setStartAddress(startAddress)
    }
  }
  const handleSetEndAddress = (value: string) => {
    const newValue = value.toUpperCase()
    if (newValue.match(/^([A-F0-9]{0,4})$/)) {
      setEndAddress(newValue)
    } else {
      setEndAddress(endAddress)
    }
  }

  const handleCancel = () => {
    props.onClose()
  }

  const handleSaveDisassembly = () => {
    props.onClose()
    const start = parseInt(startAddress, 16)
    const end = parseInt(endAddress, 16)
    let disassembly = getDisassembly(start, end)
    if (includeLabels || includeSeparator) {
      const disLines = disassembly.split("\n")
      disassembly = disLines.map((line: string) => {
        if (includeLabels) {
          line = getLineAsPlaintext(line)
        }
        if (includeSeparator) {
          if (line.includes("JMP") || line.includes("RTS")) {
            line += "\n" + "_".repeat(includeLabels ? 42 : 30)
          }
        }
        return line
      }).join("\n")
    }
    const blob = new Blob([disassembly], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `disassembly_$${startAddress}-$${endAddress}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-overlay"
      tabIndex={0} // Make the div focusable
      onKeyDown={(event) => {
        if (event.key === "Escape") handleCancel()
      }}>
      <div className="floating-dialog flex-column"
        style={{ left: "15%", top: "25%" }}>
        <div className="flex-column">
          <div className="flex-row-space-between">
            <div className="dialog-title">Save Disassembly</div>
            <button className="push-button"
              onClick={handleCancel}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
            </button>
          </div>
          <div className="horiz-rule"></div>
        </div>
        <div className="flex-column" style={{alignItems: "flex-start"}}>
        <div className="flex-column"
          style={{paddingLeft: "0.5em", paddingTop: "0.5em", alignItems: "flex-end"}}>
          <EditField name="Start address $"
            initialFocus={true}
            value={startAddress}
            setValue={handleSetStartAddress}
            width="5em" />
          <EditField name="End address $"
            initialFocus={true}
            value={endAddress}
            setValue={handleSetEndAddress}
            width="5em" />
        </div>
        </div>
        <div className="flex-row">
          <input type="checkbox" id="labels" value="labels"
            className="check-radio-box shift-down"
            checked={includeLabels}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setIncludeLabels(event.target.checked)
            }} />
          <label htmlFor="labels"
            className="dialog-title flush-left">Include symbol labels</label>
        </div>
        <div className="flex-row"
          style={{paddingRight: "1em"}}>
          <input type="checkbox" id="separator" value="separator"
            className="check-radio-box shift-down"
            checked={includeSeparator}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setIncludeSeparator(event.target.checked)
            }} />
          <label htmlFor="separator"
            className="dialog-title flush-left">Separator lines after JMP, RTS</label>
        </div>
        <div className="flex-row"
          style={{paddingTop: "2em", alignSelf: "flex-end"}}>
          <div className="flex-row">
            <button className="push-button text-button"
              onClick={handleSaveDisassembly}
              disabled={startAddress === "" || endAddress === ""}>
              <span className="centered-title">OK</span>
            </button>
            <button className="push-button text-button"
              onClick={handleCancel}>
              <span className="centered-title">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SaveDisassemblyDialog
