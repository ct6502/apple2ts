import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import EditField from "../../panels/editfield"
import { getPreferenceTraceSettings, setPreferenceTraceSettings } from "../../localstorage"

const TraceSettingsDialog = (props:
  {
    onClose: () => void,
  }) => {
  const traceSettings = getPreferenceTraceSettings()
  const [numLines, setNumLines] = useState(traceSettings.numLines.toString())
  const [collapseLoops, setCollapseLoops] = useState(traceSettings.collapseLoops)
  const [ignoreRegisters, setIgnoreRegisters] = useState(traceSettings.ignoreRegisters)

  const handleSetNumLines = (value: string) => {
    try {
      if (value === "") {
        setNumLines("")
        return
      }
      let newValue = parseInt(value)
      if (newValue >= 1 && newValue <= 100000) {
        setNumLines(value)
        newValue = Math.max(100, Math.min(100000, newValue))
        setPreferenceTraceSettings({ numLines: newValue, collapseLoops, ignoreRegisters })
      } else {
        setNumLines(numLines)
      }
    } catch {
      setNumLines(numLines)
      return
    }
  }

  const handleCancel = () => {
    props.onClose()
  }

  return (
    <div className="modal-overlay"
      tabIndex={0} // Make the div focusable
      onKeyDown={(event) => {
        if (event.key === "Escape") handleCancel()
      }}>
      <div className="floating-dialog flex-column"
        style={{ left: "45%", top: "35%"}}>
        <div className="flex-column">
          <div className="flex-row-space-between">
            <div className="dialog-title">Trace Settings</div>
            <button className="push-button"
              onClick={handleCancel}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: "0.8em" }} />
            </button>
          </div>
          <div className="horiz-rule"></div>
        </div>
        <div className="flex-column"
          style={{padding: "0.5em", paddingBottom: 0, paddingLeft: 0}}>
          <EditField name="Number of lines to keep:"
            initialFocus={true}
            value={numLines}
            setValue={handleSetNumLines}
            width="5em" />
        </div>
        <div className="flex-column"
          style={{paddingLeft: "0.5em"}}>
          <span className="warning-text">
            {(parseInt(numLines) < 100  || parseInt(numLines) > 100000) ? "Must be between 100 and 100000" : "\u00A0"}
          </span>
        </div>
        <div className="flex-row">
          <input type="checkbox" id="collapseLoops" value="collapseLoops"
            className="check-radio-box shift-down"
            checked={collapseLoops}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCollapseLoops(event.target.checked)
              setPreferenceTraceSettings({ numLines: parseInt(numLines), collapseLoops: event.target.checked, ignoreRegisters: ignoreRegisters })
            }} />
          <label htmlFor="collapseLoops"
            className="dialog-title flush-left">Find repeating lines and collapse loops</label>
        </div>
        <div className="flex-row">
          <input type="checkbox" id="ignoreRegisters" value="ignoreRegisters"
            className="check-radio-box shift-down"
            checked={ignoreRegisters}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setIgnoreRegisters(event.target.checked)
              setPreferenceTraceSettings({ numLines: parseInt(numLines), collapseLoops: collapseLoops, ignoreRegisters: event.target.checked })
            }} />
          <label htmlFor="ignoreRegisters"
            className="dialog-title flush-left">Ignore register values when finding repeating lines</label>
        </div>
        <div className="flex-row"
          style={{paddingBottom: "1em"}}>
        </div>
      </div>
    </div>
  )
}

export default TraceSettingsDialog
