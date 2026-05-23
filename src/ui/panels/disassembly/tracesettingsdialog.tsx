import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faXmark,
} from "@fortawesome/free-solid-svg-icons"
import EditField from "../../panels/editfield"
import { getPreferenceTraceSettings, setPreferenceTraceSettings } from "../../localstorage"
import CheckBox from "../checkbox"

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
            isNumber={true}
            width="5em" />
        </div>
        <div className="flex-column"
          style={{paddingLeft: "0.5em"}}>
          <span className="warning-text">
            {(parseInt(numLines) < 100  || parseInt(numLines) > 100000) ? "Must be between 100 and 100000" : "\u00A0"}
          </span>
        </div>
        <CheckBox name="Collapse loops by finding repeating lines"
          checked={collapseLoops}
          setChecked={(checked: boolean) => {
            setCollapseLoops(checked)
            setPreferenceTraceSettings({ numLines: parseInt(numLines), collapseLoops: checked, ignoreRegisters })
          }} />
        <CheckBox name="Ignore register values when finding repeating lines"
          checked={ignoreRegisters}
          setChecked={(checked: boolean) => {
            setIgnoreRegisters(checked)
            setPreferenceTraceSettings({ numLines: parseInt(numLines), collapseLoops, ignoreRegisters: checked })
          }} />
        <div className="flex-row"
          style={{paddingBottom: "1em"}}>
        </div>
      </div>
    </div>
  )
}

export default TraceSettingsDialog
